import { abrirSessao, chaveDoIp, limparFalhas, minutosBloqueado, registrarFalha, verificarPin } from '@/lib/auth'
import { getConfig } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(
  async (req: Request) => {
    const corpo = await req.json().catch(() => null)
    const pin = String(corpo?.pin ?? '')
    if (!/^\d{4}$/.test(pin)) return resposta({ erro: 'formato' }, 400)

    const armazenado = await getConfig('pin_hash')
    if (!armazenado) return resposta({ erro: 'sem_pin' }, 409)

    const ip = await chaveDoIp()
    const minutos = await minutosBloqueado([ip, 'global'])
    if (minutos > 0) return resposta({ erro: 'bloqueado', minutos }, 429)

    if (!(await verificarPin(pin, armazenado))) {
      const restantes = await registrarFalha(ip, 5, 15)
      await registrarFalha('global', 12, 60)
      return resposta({ erro: 'pin_incorreto', restantes }, 401)
    }

    await limparFalhas([ip, 'global'])
    await abrirSessao()
    return resposta({ ok: true })
  },
  { publica: true },
)
