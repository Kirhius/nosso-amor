// Uso: npm run gerar-chaves
// Gera SESSION_SECRET, CRON_SECRET e as chaves VAPID (avisos push).
import { randomBytes } from 'node:crypto'
import webpush from 'web-push'

const vapid = webpush.generateVAPIDKeys()

console.log('Copie estas linhas para o seu .env.local e para as variaveis do Vercel:\n')
console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`)
console.log(`CRON_SECRET=${randomBytes(24).toString('hex')}`)
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapid.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapid.privateKey}`)
