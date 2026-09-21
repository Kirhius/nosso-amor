import { NextResponse } from 'next/server'
import { sessaoValida } from './auth'

export const resposta = (dados: unknown, status = 200) => NextResponse.json(dados, { status })

/** Envolve a rota: trata erros e (opcionalmente) exige sessao. */
export function rota<A extends unknown[]>(
  fn: (...args: A) => Promise<Response>,
  opcoes: { publica?: boolean } = {},
) {
  return async (...args: A): Promise<Response> => {
    try {
      if (!opcoes.publica && !(await sessaoValida())) {
        return resposta({ erro: 'nao_autorizado' }, 401)
      }
      return await fn(...args)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Erro na rota:', e)
      const detalhe = msg.startsWith('Variavel de ambiente ausente') ? msg : undefined
      return resposta({ erro: 'servidor', detalhe }, 500)
    }
  }
}

export function urlBase(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '')
  return new URL(req.url).origin
}
