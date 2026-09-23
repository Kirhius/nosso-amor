import { CONFIG } from '@/lib/config'
import { enviarParaOutro } from '@/lib/push'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

// Chamado pelo navegador depois de importar uma ou mais fotos, para avisar o outro uma unica vez.
export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const autor = String(corpo?.autor ?? '')
  const quantidade = Math.max(1, Math.min(200, Number(corpo?.quantidade) || 1))
  if (autor !== 'ele' && autor !== 'ela') return resposta({ erro: 'autor_invalido' }, 400)

  const nome = autor === 'ele' ? CONFIG.nomeEle : CONFIG.nomeEla
  const corpoMsg = quantidade === 1 ? `${nome} adicionou uma foto nova ❤️` : `${nome} adicionou ${quantidade} fotos novas ❤️`
  enviarParaOutro(autor, CONFIG.titulo, corpoMsg).catch(() => {})
  return resposta({ ok: true })
})
