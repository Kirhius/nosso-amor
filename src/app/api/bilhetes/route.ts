import { CONFIG } from '@/lib/config'
import { listarBilhetes } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import { enviarParaAutor } from '@/lib/push'
import type { Autor } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

function autorValido(v: unknown): v is Autor {
  return v === 'ele' || v === 'ela'
}
const nomeDe = (a: Autor) => (a === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla)

export const GET = rota(async () => resposta({ bilhetes: await listarBilhetes() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const de = corpo?.de
  const para = corpo?.para
  const texto = String(corpo?.texto ?? '').trim().slice(0, 1000)
  if (!autorValido(de) || !autorValido(para)) return resposta({ erro: 'autor_invalido' }, 400)
  if (!texto) return resposta({ erro: 'texto_obrigatorio' }, 400)

  const q = await db()
  await q`INSERT INTO bilhetes (de, para, texto) VALUES (${de}, ${para}, ${texto})`

  if (para !== de) {
    enviarParaAutor(para, CONFIG.titulo, `${nomeDe(de)} deixou um bilhete para você ❤️`).catch(() => {})
  }

  return resposta({ bilhetes: await listarBilhetes() })
})
