import { listarPontosMapa } from '@/lib/dados'
import { db } from '@/lib/db'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = rota(async () => resposta({ pontos: await listarPontosMapa() }))

export const POST = rota(async (req: Request) => {
  const corpo = await req.json().catch(() => null)
  const latitude = Number(corpo?.latitude)
  const longitude = Number(corpo?.longitude)
  const local = String(corpo?.local ?? '').trim().slice(0, 150)
  const data = String(corpo?.data ?? '').trim()
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return resposta({ erro: 'latitude_invalida' }, 400)
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return resposta({ erro: 'longitude_invalida' }, 400)
  if (data && (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data)))) {
    return resposta({ erro: 'data_invalida' }, 400)
  }
  const q = await db()
  await q`INSERT INTO mapa_pontos (latitude, longitude, local, data)
          VALUES (${latitude}, ${longitude}, ${local}, ${data || null})`
  return resposta({ pontos: await listarPontosMapa() })
})
