import { listarQuizPara } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import type { Autor, TipoPerguntaQuiz } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

function autorValido(v: unknown): v is Autor {
  return v === 'ele' || v === 'ela'
}

export const GET = rota(async (req: Request) => {
  const para = new URL(req.url).searchParams.get('para')
  if (!autorValido(para)) return resposta({ erro: 'parametro_invalido' }, 400)
  return resposta({ perguntas: await listarQuizPara(para) })
})

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const autor = corpo?.autor
  const tipo: TipoPerguntaQuiz = corpo?.tipo === 'texto' ? 'texto' : 'escolha'
  const pergunta = String(corpo?.pergunta ?? '').trim().slice(0, 300)

  if (!autorValido(autor)) return resposta({ erro: 'autor_invalido' }, 400)
  if (!pergunta) return resposta({ erro: 'pergunta_obrigatoria' }, 400)

  const q = await db()

  if (tipo === 'texto') {
    const respostaTexto = String(corpo?.respostaTexto ?? '').trim().slice(0, 200)
    if (!respostaTexto) return resposta({ erro: 'resposta_obrigatoria' }, 400)
    await q`INSERT INTO quiz_perguntas (autor_criador, tipo, pergunta, resposta_texto)
            VALUES (${autor}, 'texto', ${pergunta}, ${respostaTexto})`
  } else {
    const opcoes = Array.isArray(corpo?.opcoes) ? corpo.opcoes.map((o: unknown) => String(o).trim().slice(0, 150)) : []
    const opcaoCorreta = Number(corpo?.opcaoCorreta)
    if (opcoes.length !== 4 || opcoes.some((o: string) => !o)) return resposta({ erro: 'opcoes_invalidas' }, 400)
    if (!Number.isInteger(opcaoCorreta) || opcaoCorreta < 0 || opcaoCorreta > 3) {
      return resposta({ erro: 'opcao_correta_invalida' }, 400)
    }
    await q`INSERT INTO quiz_perguntas (autor_criador, tipo, pergunta, opcoes, opcao_correta)
            VALUES (${autor}, 'escolha', ${pergunta}, ${JSON.stringify(opcoes)}, ${opcaoCorreta})`
  }

  return resposta({ perguntas: await listarQuizPara(autor) })
})
