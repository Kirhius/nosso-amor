import { encerrarSessao } from '@/lib/auth'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(
  async () => {
    await encerrarSessao()
    return resposta({ ok: true })
  },
  { publica: true },
)
