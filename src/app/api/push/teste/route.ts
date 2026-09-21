import { CONFIG } from '@/lib/config'
import { enviarParaTodos } from '@/lib/push'
import { resposta, rota } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const POST = rota(async () => {
  const r = await enviarParaTodos(CONFIG.titulo, 'Teste de aviso: está tudo funcionando ❤️')
  return resposta(r)
})
