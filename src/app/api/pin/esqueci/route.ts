import { createHash, randomBytes } from 'node:crypto'
import { CONFIG } from '@/lib/config'
import { db, getConfig, setConfig } from '@/lib/db'
import { enviarEmail } from '@/lib/email'
import { resposta, rota, urlBase } from '@/lib/http'

export const dynamic = 'force-dynamic'

function mascarar(email: string) {
  const [usuario, dominio] = email.split('@')
  if (!dominio) return email
  return `${usuario.slice(0, 1)}${'*'.repeat(Math.max(2, usuario.length - 1))}@${dominio}`
}

export const POST = rota(
  async (req: Request) => {
    const email = process.env.EMAIL_RECUPERACAO
    if (!email) return resposta({ erro: 'sem_email' }, 500)

    // No maximo um e-mail a cada 2 minutos.
    const ultimo = Number((await getConfig('ultimo_reset')) ?? 0)
    if (Date.now() - ultimo < 120_000) return resposta({ erro: 'aguarde' }, 429)
    await setConfig('ultimo_reset', String(Date.now()))

    const token = randomBytes(32).toString('hex')
    const hash = createHash('sha256').update(token).digest('hex')
    const q = await db()
    await q`DELETE FROM reset_tokens WHERE expira_em < now() OR usado = true`
    await q`INSERT INTO reset_tokens (hash, expira_em) VALUES (${hash}, now() + interval '30 minutes')`

    const link = `${urlBase(req)}/redefinir?token=${token}`
    await enviarEmail(
      email,
      `Redefinir o PIN - ${CONFIG.titulo}`,
      `<div style="font-family:Georgia,serif;font-size:16px;color:#43122a">
        <p>Olá! Use o botão abaixo para criar um novo PIN.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 22px;background:#e85d7f;color:#fff;border-radius:999px;text-decoration:none">Criar novo PIN</a></p>
        <p style="font-size:13px;color:#7a5560">O link vale por 30 minutos e só funciona uma vez. Se não foi você quem pediu, ignore este e-mail.</p>
      </div>`,
    )
    return resposta({ ok: true, email: mascarar(email) })
  },
  { publica: true },
)
