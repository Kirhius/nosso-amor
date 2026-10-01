import { CONFIG } from '@/lib/config'
import { listarEventos } from '@/lib/dados'
import { diasAteData } from '@/lib/tempo'
import { enviarParaTodos } from '@/lib/push'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

// Chamada todo dia pelo Vercel Cron (ver vercel.json): avisa 7 dias antes de um evento e no dia do evento.
export const GET = rota(
  async (req: Request) => {
    const segredo = process.env.CRON_SECRET
    if (!segredo || req.headers.get('authorization') !== `Bearer ${segredo}`) {
      return resposta({ erro: 'nao_autorizado' }, 401)
    }

    const eventos = await listarEventos()
    const enviados: string[] = []

    for (const ev of eventos) {
      const dias = diasAteData(ev.data)
      if (dias === 7) {
        await enviarParaTodos(CONFIG.titulo, `Faltam 7 dias para ${ev.titulo}`)
        enviados.push(`7 dias: ${ev.titulo}`)
      } else if (dias === 0) {
        await enviarParaTodos(CONFIG.titulo, `HOJE TEM ${ev.titulo} ❤️`)
        enviados.push(`hoje: ${ev.titulo}`)
      }
    }

    return resposta({ enviados })
  },
  { publica: true },
)
