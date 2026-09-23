import { CONFIG } from '@/lib/config'
import { listarMomentos } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'
import { enviarParaOutro } from '@/lib/push'

export const dynamic = 'force-dynamic'

export const GET = rota(async () => resposta({ momentos: await listarMomentos() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const titulo = String(corpo?.titulo ?? '').trim().slice(0, 120)
  const data = String(corpo?.data ?? '')
  const descricao = String(corpo?.descricao ?? '').trim().slice(0, 2000)
  const autor = String(corpo?.autor ?? '')
  if (!titulo) return resposta({ erro: 'titulo_obrigatorio' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`INSERT INTO momentos (titulo, data, descricao) VALUES (${titulo}, ${data}, ${descricao})`
  if (autor === 'ele' || autor === 'ela') {
    const nome = autor === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla
    enviarParaOutro(autor, CONFIG.titulo, `${nome} guardou um momento: "${titulo}"`).catch(() => {})
  }
  return resposta({ momentos: await listarMomentos() })
})
