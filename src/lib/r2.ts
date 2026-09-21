import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { exigir } from './env'

let _c: S3Client | null = null
function cliente() {
  if (!_c) {
    _c = new S3Client({
      region: 'auto',
      endpoint: `https://${exigir('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: exigir('R2_ACCESS_KEY_ID'),
        secretAccessKey: exigir('R2_SECRET_ACCESS_KEY'),
      },
      // Sem isso, o SDK novo coloca checksums na URL assinada e o R2 recusa o envio.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }
  return _c
}

const bucket = () => exigir('R2_BUCKET')

export const chaveFull = (id: string) => `fotos/${id}.jpg`
export const chaveThumb = (id: string) => `fotos/${id}_t.jpg`

export function urlEnvio(chave: string) {
  return getSignedUrl(
    cliente(),
    new PutObjectCommand({ Bucket: bucket(), Key: chave, ContentType: 'image/jpeg' }),
    { expiresIn: 600 },
  )
}

/** URL de leitura estavel por hora (ajuda o cache do navegador). Vale de 1h a 2h. */
export function urlLeitura(chave: string) {
  return getSignedUrl(
    cliente(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: chave,
      ResponseCacheControl: 'private, max-age=3600',
    }),
    { expiresIn: 7200, signingDate: new Date(Math.floor(Date.now() / 3600000) * 3600000) },
  )
}

export async function existe(chave: string): Promise<boolean> {
  try {
    await cliente().send(new HeadObjectCommand({ Bucket: bucket(), Key: chave }))
    return true
  } catch {
    return false
  }
}

export async function apagar(chave: string): Promise<void> {
  await cliente().send(new DeleteObjectCommand({ Bucket: bucket(), Key: chave }))
}
