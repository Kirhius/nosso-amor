import { CONFIG } from '@/lib/config'
import { listarQuizPara } from '@/lib/dados'
import { db, UUID_RE } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import { enviarParaOutro } from '@/lib/push'
import type { Autor } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

export const POST = rota(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!UUID_RE.test(id)) return resposta({ erro: 'id_invalido' }, 400)
  const corpo = await req.json().catch(() => null)
  const autor = corpo?.autor as Autor | undefined
  const opcaoEscolhida = Number(corpo?.opcaoEscolhida)
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)
  if (!Number.isInteger(opcaoEscolhida) || opcaoEscolhida < 0 || opcaoEscolhida > 3) {
    return resposta({ erro: 'opcao_invalida' }, 400)
  }

  const q = await db()
  const linha = await q`SELECT autor_criador, opcao_correta, respondida_em FROM quiz_perguntas WHERE id = ${id}`
  if (!linha.length) return resposta({ erro: 'nao_encontrada' }, 404)
  if (String(linha[0].autor_criador) === autor) return resposta({ erro: 'nao_pode_responder_a_propria' }, 403)
  if (linha[0].respondida_em !== null) return resposta({ erro: 'ja_respondida' }, 409)

  await q`UPDATE quiz_perguntas SET opcao_respondida = ${opcaoEscolhida}, respondida_em = now() WHERE id = ${id}`

  const acertou = Number(linha[0].opcao_correta) === opcaoEscolhida
  const nome = autor === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla
  enviarParaOutro(autor, CONFIG.titulo, `${nome} respondeu sua pergunta do quiz e ${acertou ? 'acertou' : 'errou'} ❤️`).catch(() => {})

  return resposta({ perguntas: await listarQuizPara(autor) })
})
