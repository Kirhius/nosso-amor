import { CONFIG } from '@/lib/config'
import { fraseDoDia } from '@/lib/frases'
import { enviarParaTodos } from '@/lib/push'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

function resumir(texto: string, limite = 140): string {
  return texto.length > limite ? `${texto.slice(0, limite - 1)}…` : texto
}

// Chamada todo dia pelo Vercel Cron (ver vercel.json), so para lembrar de abrir o app e ver a frase do dia.
export const GET = rota(
  async (req: Request) => {
    const segredo = process.env.CRON_SECRET
    if (!segredo || req.headers.get('authorization') !== `Bearer ${segredo}`) {
      return resposta({ erro: 'nao_autorizado' }, 401)
    }
    const frase = fraseDoDia()
    const resultado = await enviarParaTodos(`Frase do dia — ${CONFIG.titulo}`, resumir(`"${frase.texto}"`))
    return resposta({ frase: frase.texto, resultado })
  },
  { publica: true },
)
