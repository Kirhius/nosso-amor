# Henrique e Renata

PWA privado para duas pessoas: contador de tempo juntos, fotos, momentos marcantes e curiosidades, com PIN de 4 digitos e avisos de aniversario (mesversario e a cada 100 dias).

Stack: Next.js (App Router) + Neon (Postgres) + Cloudflare R2 (fotos) + Resend (e-mail do PIN) + Web Push + Vercel.

## 1. Servicos (todos com plano gratuito)

**Neon**: crie um projeto em neon.tech, copie a *connection string* para `DATABASE_URL`. As tabelas sao criadas sozinhas na primeira abertura do app.

**Cloudflare R2** (fotos):
1. Em R2, crie o bucket `amor-fotos` e deixe o acesso publico desligado.
2. Em *Manage API Tokens*, crie um token com permissao *Object Read & Write* so para esse bucket. Guarde Access Key ID e Secret.
3. Em *Settings > CORS Policy* do bucket, cole:
```json
[
  {
    "AllowedOrigins": ["https://SEU-APP.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```
4. Preencha `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

**Resend** (e-mail do "Esqueci o PIN"): crie a conta em resend.com, gere uma API key em `RESEND_API_KEY` e coloque o seu e-mail em `EMAIL_RECUPERACAO` (use o mesmo e-mail da conta Resend, pois sem dominio proprio o Resend so entrega para ele).

## 2. Rodar localmente

```
npm install
npm run gerar-chaves        # copie as linhas geradas para o .env.local
copy .env.example .env.local   # (Windows) e preencha
npm run dev
```

Abra http://localhost:3000. No primeiro acesso ainda nao existe PIN: toque em "Enviar link para criar o PIN". Em desenvolvimento, sem `RESEND_API_KEY`, o link aparece no terminal.

## 3. Publicar no Vercel

1. Suba o projeto para o GitHub e importe no Vercel.
2. Em *Settings > Environment Variables*, cadastre TODAS as variaveis do `.env.example` (com `APP_URL` = endereco do Vercel). `NEXT_PUBLIC_VAPID_PUBLIC_KEY` precisa existir antes do deploy.
3. Volte no CORS do R2 e ponha o endereco real do app.
4. O cron diario (`vercel.json`) roda as 08h30 de Brasilia. No plano gratuito o horario pode variar dentro da hora.

## 4. Instalar nos celulares

- **Android (Xiaomi)**: abra o link no Chrome, menu (tres pontos), *Instalar app*. (O botao de avisos de aniversario foi retirado da tela; o codigo dos avisos continua no projeto, em `BotaoNotificacoes.tsx` e no cron.)
- **iPhone**: abra o link no Safari, *Compartilhar > Adicionar a Tela de Inicio*, abra o app pelo icone novo.

## 5. Personalizar

- Textos e data de inicio: `src/lib/config.ts`.
- Cores e fontes: `src/app/globals.css` (variaveis no topo).
- Icones: `python3 scripts/gerar_icones.py`.

## Seguranca (resumo)

- O PIN e validado no servidor, guardado com scrypt + segredo do servidor, e a sessao e um cookie assinado (30 dias).
- 5 erros seguidos bloqueiam aquele aparelho/rede por 15 min; 12 erros no total bloqueiam todos por 1 h.
- Fotos ficam em bucket privado e so sao servidas por links temporarios, depois de o PIN ser aceito.
- Trocar o PIN (Esqueci o PIN) encerra todas as sessoes abertas.
- Se mudar `SESSION_SECRET`, o PIN antigo deixa de valer: use "Esqueci o PIN".
- Quatro digitos sao poucos: o bloqueio de tentativas e o que protege. Nao desative.
