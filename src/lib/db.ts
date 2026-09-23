import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { exigir } from './env'

let _sql: NeonQueryFunction<false, false> | null = null
function cliente() {
  if (!_sql) _sql = neon(exigir('DATABASE_URL'))
  return _sql
}

let pronto: Promise<void> | null = null

/** Cria as tabelas na primeira chamada (idempotente). */
function garantirSchema(): Promise<void> {
  if (!pronto) {
    pronto = (async () => {
      const q = cliente()
      await q`CREATE TABLE IF NOT EXISTS config (
        chave text PRIMARY KEY,
        valor text NOT NULL
      )`
      await q`CREATE TABLE IF NOT EXISTS pin_tentativas (
        chave text PRIMARY KEY,
        erros int NOT NULL DEFAULT 0,
        bloqueado_ate timestamptz,
        atualizado_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`CREATE TABLE IF NOT EXISTS reset_tokens (
        hash text PRIMARY KEY,
        expira_em timestamptz NOT NULL,
        usado boolean NOT NULL DEFAULT false
      )`
      await q`CREATE TABLE IF NOT EXISTS fotos (
        id uuid PRIMARY KEY,
        legenda text NOT NULL DEFAULT '',
        largura int NOT NULL DEFAULT 0,
        altura int NOT NULL DEFAULT 0,
        criada_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`CREATE TABLE IF NOT EXISTS momentos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo text NOT NULL,
        data date NOT NULL,
        descricao text NOT NULL DEFAULT '',
        criado_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`CREATE TABLE IF NOT EXISTS viagens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        local text NOT NULL,
        data date NOT NULL,
        criada_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`CREATE TABLE IF NOT EXISTS curiosidades (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        texto text NOT NULL,
        criada_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`ALTER TABLE curiosidades ADD COLUMN IF NOT EXISTS autor text NOT NULL DEFAULT 'ele'`
      await q`CREATE TABLE IF NOT EXISTS push_inscricoes (
        endpoint text PRIMARY KEY,
        p256dh text NOT NULL,
        auth text NOT NULL,
        criada_em timestamptz NOT NULL DEFAULT now()
      )`
      await q`ALTER TABLE push_inscricoes ADD COLUMN IF NOT EXISTS autor text NOT NULL DEFAULT 'ele'`
    })().catch((e) => {
      pronto = null
      throw e
    })
  }
  return pronto
}

/** Devolve o cliente SQL ja com as tabelas garantidas. */
export async function db() {
  await garantirSchema()
  return cliente()
}

export async function getConfig(chave: string): Promise<string | null> {
  const q = await db()
  const r = await q`SELECT valor FROM config WHERE chave = ${chave}`
  return r.length ? String(r[0].valor) : null
}

export async function setConfig(chave: string, valor: string): Promise<void> {
  const q = await db()
  await q`INSERT INTO config (chave, valor) VALUES (${chave}, ${valor})
          ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor`
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
