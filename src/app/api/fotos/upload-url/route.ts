import { randomUUID } from 'node:crypto'
import { chaveFull, chaveThumb, urlEnvio } from '@/lib/r2'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(async () => {
  const id = randomUUID()
  return resposta({
    id,
    urlFull: await urlEnvio(chaveFull(id)),
    urlThumb: await urlEnvio(chaveThumb(id)),
  })
})
