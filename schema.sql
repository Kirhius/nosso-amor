-- Referencia. O app cria estas tabelas sozinho na primeira execucao.
CREATE TABLE IF NOT EXISTS config (chave text PRIMARY KEY, valor text NOT NULL);
CREATE TABLE IF NOT EXISTS pin_tentativas (
  chave text PRIMARY KEY, erros int NOT NULL DEFAULT 0,
  bloqueado_ate timestamptz, atualizado_em timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reset_tokens (
  hash text PRIMARY KEY, expira_em timestamptz NOT NULL, usado boolean NOT NULL DEFAULT false);
CREATE TABLE IF NOT EXISTS fotos (
  id uuid PRIMARY KEY, legenda text NOT NULL DEFAULT '', largura int NOT NULL DEFAULT 0,
  altura int NOT NULL DEFAULT 0, criada_em timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS momentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), titulo text NOT NULL, data date NOT NULL,
  descricao text NOT NULL DEFAULT '', criado_em timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS viagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), local text NOT NULL, data date NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS curiosidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), texto text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now());
ALTER TABLE curiosidades ADD COLUMN IF NOT EXISTS autor text NOT NULL DEFAULT 'ele';
CREATE TABLE IF NOT EXISTS push_inscricoes (
  endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now());
