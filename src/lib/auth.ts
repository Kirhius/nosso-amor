import { scrypt, randomBytes, timingSafeEqual, createHash, createHmac } from 'node:crypto'
import { promisify } from 'node:util'
import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'
import { db, getConfig } from './db'
import { exigir } from './env'

const scryptAsync = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
) => Promise<Buffer>

/* ---------- PIN ---------- */

// O PIN passa por um HMAC com o SESSION_SECRET antes do scrypt ("pimenta"):
// se alguem vazar so o banco, nao consegue testar os 10.000 PINs offline.
const pimentar = (pin: string) => createHmac('sha256', exigir('SESSION_SECRET')).update(pin).digest('hex')

export async function hashPin(pin: string): Promise<string> {
  const sal = randomBytes(16)
  const chave = await scryptAsync(pimentar(pin), sal, 32)
  return `${sal.toString('hex')}:${chave.toString('hex')}`
}

export async function verificarPin(pin: string, armazenado: string): Promise<boolean> {
  const [salHex, chaveHex] = armazenado.split(':')
  if (!salHex || !chaveHex) return false
  const esperado = Buffer.from(chaveHex, 'hex')
  const obtido = await scryptAsync(pimentar(pin), Buffer.from(salHex, 'hex'), esperado.length)
  return obtido.length === esperado.length && timingSafeEqual(obtido, esperado)
}

/* ---------- Sessao (cookie assinado) ---------- */

const COOKIE = 'amor_sessao'
const chaveJwt = () => new TextEncoder().encode(exigir('SESSION_SECRET'))
const versaoSessao = async () => (await getConfig('sessao_versao')) ?? '1'

export async function abrirSessao(): Promise<void> {
  const token = await new SignJWT({ v: await versaoSessao() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(chaveJwt())
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function sessaoValida(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, chaveJwt())
    return payload.v === (await versaoSessao())
  } catch {
    return false
  }
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE)
}

/** Invalida todas as sessoes existentes (usado ao trocar o PIN). */
export async function invalidarSessoes(): Promise<void> {
  const q = await db()
  await q`INSERT INTO config (chave, valor) VALUES ('sessao_versao', '2')
          ON CONFLICT (chave) DO UPDATE SET valor = (config.valor::int + 1)::text`
}

/* ---------- Limite de tentativas ---------- */

export async function chaveDoIp(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || 'desconhecido').split(',')[0].trim()
  return 'ip:' + createHash('sha256').update(ip + exigir('SESSION_SECRET')).digest('hex').slice(0, 24)
}

/** Minutos restantes de bloqueio (0 = liberado). */
export async function minutosBloqueado(chaves: string[]): Promise<number> {
  const q = await db()
  const r = await q`SELECT COALESCE(MAX(EXTRACT(EPOCH FROM (bloqueado_ate - now()))), 0) AS seg
                    FROM pin_tentativas
                    WHERE chave = ANY(${chaves}) AND bloqueado_ate > now()`
  const seg = Number(r[0]?.seg ?? 0)
  return seg > 0 ? Math.ceil(seg / 60) : 0
}

/** Registra um erro. Devolve quantas tentativas ainda restam antes de bloquear. */
export async function registrarFalha(chave: string, limite: number, minutosBloqueio: number): Promise<number> {
  const q = await db()
  const r = await q`INSERT INTO pin_tentativas (chave, erros, atualizado_em) VALUES (${chave}, 1, now())
    ON CONFLICT (chave) DO UPDATE SET
      erros = CASE WHEN pin_tentativas.atualizado_em < now() - interval '1 hour' THEN 1 ELSE pin_tentativas.erros + 1 END,
      atualizado_em = now()
    RETURNING erros`
  const erros = Number(r[0].erros)
  if (erros >= limite) {
    await q`UPDATE pin_tentativas SET erros = 0, bloqueado_ate = now() + make_interval(mins => ${minutosBloqueio}::int)
            WHERE chave = ${chave}`
    return 0
  }
  return limite - erros
}

export async function limparFalhas(chaves: string[]): Promise<void> {
  const q = await db()
  await q`DELETE FROM pin_tentativas WHERE chave = ANY(${chaves})`
}

export async function limparTodasFalhas(): Promise<void> {
  const q = await db()
  await q`DELETE FROM pin_tentativas`
}
