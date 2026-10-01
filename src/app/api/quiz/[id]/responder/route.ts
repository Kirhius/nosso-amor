import { CONFIG } from '@/lib/config'
import { listarQuizPara, normalizarTexto } from '@/lib/dados'
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
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)

  const q = await db()
  const linha = await q`SELECT autor_criador, tipo, opcao_correta, resposta_texto, respondida_em FROM quiz_perguntas WHERE id = ${id}`
  if (!linha.length) return resposta({ erro: 'nao_encontrada' }, 404)
  if (String(linha[0].autor_criador) === autor) return resposta({ erro: 'nao_pode_responder_a_propria' }, 403)
  if (linha[0].respondida_em !== null) return resposta({ erro: 'ja_respondida' }, 409)

  const tipo = String(linha[0].tipo) === 'texto' ? 'texto' : 'escolha'
  let acertou: boolean

  if (tipo === 'texto') {
    const respostaTextoDada = String(corpo?.respostaTextoDada ?? '').trim().slice(0, 200)
    if (!respostaTextoDada) return resposta({ erro: 'resposta_obrigatoria' }, 400)
    acertou = normalizarTexto(respostaTextoDada) === normalizarTexto(String(linha[0].resposta_texto ?? ''))
    await q`UPDATE quiz_perguntas SET resposta_texto_dada = ${respostaTextoDada}, respondida_em = now() WHERE id = ${id}`
  } else {
    const opcaoEscolhida = Number(corpo?.opcaoEscolhida)
    if (!Number.isInteger(opcaoEscolhida) || opcaoEscolhida < 0 || opcaoEscolhida > 3) {
      return resposta({ erro: 'opcao_invalida' }, 400)
    }
    acertou = Number(linha[0].opcao_correta) === opcaoEscolhida
    await q`UPDATE quiz_perguntas SET opcao_respondida = ${opcaoEscolhida}, respondida_em = now() WHERE id = ${id}`
  }

  const nome = autor === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla
  const resultado = acertou ? 'acertou' : 'errou'
  enviarParaOutro(autor, CONFIG.titulo, nome + ' respondeu sua pergunta do quiz e ' + resultado + ' \u2764\ufe0f').catch(() => {})

  return resposta({ perguntas: await listarQuizPara(autor) })
})
