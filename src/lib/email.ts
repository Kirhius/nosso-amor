import { CONFIG } from './config'

export async function enviarEmail(para: string, assunto: string, html: string): Promise<void> {
  const chave = process.env.RESEND_API_KEY
  if (!chave) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email simulado]', { para, assunto, html })
      return
    }
    throw new Error('Variavel de ambiente ausente: RESEND_API_KEY')
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || `${CONFIG.titulo} <onboarding@resend.dev>`,
      to: [para],
      subject: assunto,
      html,
    }),
  })
  if (!r.ok) throw new Error(`Falha ao enviar e-mail (${r.status}): ${await r.text()}`)
}
