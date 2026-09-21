export function exigir(nome: string): string {
  const v = process.env[nome]
  if (!v) throw new Error(`Variavel de ambiente ausente: ${nome}`)
  return v
}

/** Variaveis sem as quais o app nem abre. */
export function faltandoEssenciais(): string[] {
  const faltando = ['DATABASE_URL', 'SESSION_SECRET'].filter((k) => !process.env[k])
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    faltando.push('SESSION_SECRET (minimo de 32 caracteres)')
  }
  return faltando
}
