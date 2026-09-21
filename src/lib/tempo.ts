import { CONFIG } from './config'

export const INICIO_MS = new Date(CONFIG.inicioISO).getTime()

// Brasilia (sem horario de verao desde 2019): UTC-3 fixo.
const OFFSET_MS = -3 * 60 * 60 * 1000
const brt = (ms: number) => new Date(ms + OFFSET_MS)

export type Tempo = {
  anos: number
  meses: number
  dias: number
  horas: number
  minutos: number
  segundos: number
}

/** Diferenca de calendario (anos, meses, dias, horas, minutos, segundos) no fuso de Brasilia. */
export function decompor(agoraMs: number, inicioMs: number = INICIO_MS): Tempo {
  const zero: Tempo = { anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 }
  if (agoraMs <= inicioMs) return zero

  const a = brt(agoraMs)
  const b = brt(inicioMs)

  let anos = a.getUTCFullYear() - b.getUTCFullYear()
  let meses = a.getUTCMonth() - b.getUTCMonth()
  let dias = a.getUTCDate() - b.getUTCDate()
  let horas = a.getUTCHours() - b.getUTCHours()
  let minutos = a.getUTCMinutes() - b.getUTCMinutes()
  let segundos = a.getUTCSeconds() - b.getUTCSeconds()

  if (segundos < 0) { segundos += 60; minutos-- }
  if (minutos < 0) { minutos += 60; horas-- }
  if (horas < 0) { horas += 24; dias-- }
  if (dias < 0) {
    dias += new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), 0)).getUTCDate()
    meses--
  }
  if (meses < 0) { meses += 12; anos-- }

  return { anos, meses, dias, horas, minutos, segundos }
}

/** Mensagens de aviso para o dia de hoje (mesversario, aniversario e a cada 100 dias). */
export function marcosDeHoje(agoraMs: number): string[] {
  const a = brt(agoraMs)
  const b = brt(INICIO_MS)
  const saida: string[] = []

  const meses = (a.getUTCFullYear() - b.getUTCFullYear()) * 12 + (a.getUTCMonth() - b.getUTCMonth())
  const diasNoMes = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + 1, 0)).getUTCDate()
  const diaAlvo = Math.min(b.getUTCDate(), diasNoMes)

  if (meses > 0 && a.getUTCDate() === diaAlvo) {
    if (meses % 12 === 0) {
      const anos = meses / 12
      saida.push(anos === 1 ? 'Hoje faz 1 ano juntos ❤️' : `Hoje fazem ${anos} anos juntos ❤️`)
    } else {
      saida.push(meses === 1 ? 'Hoje faz 1 mês juntos ❤️' : `Hoje fazem ${meses} meses juntos ❤️`)
    }
  }

  const dias = Math.round(
    (Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()) -
      Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())) / 86400000,
  )
  if (dias > 0 && dias % 100 === 0) saida.push(`Hoje fazem ${dias} dias juntos ❤️`)

  return saida
}
