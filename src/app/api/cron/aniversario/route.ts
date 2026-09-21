import { CONFIG } from '@/lib/config'
import { enviarParaTodos } from '@/lib/push'
import { marcosDeHoje } from '@/lib/tempo'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

// Chamada todo dia pelo Vercel Cron (ver vercel.json).
// O Vercel envia "Authorization: Bearer <CRON_SECRET>" quando CRON_SECRET existe.
export const GET = rota(
  async (req: Request) => {
    const segredo = process.env.CRON_SECRET
    if (!segredo || req.headers.get('authorization') !== `Bearer ${segredo}`) {
      return resposta({ erro: 'nao_autorizado' }, 401)
    }
    const mensagens = marcosDeHoje(Date.now())
    const resultados = []
    for (const m of mensagens) resultados.push(await enviarParaTodos(CONFIG.titulo, m))
    return resposta({ mensagens, resultados })
  },
  { publica: true },
)
