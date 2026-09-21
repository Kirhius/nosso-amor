'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Foto } from '@/lib/tipos'
import { IconeCamera } from './Icones'

type Decodificada = { fonte: CanvasImageSource; w: number; h: number; liberar: () => void }

async function decodificar(arquivo: File): Promise<Decodificada> {
  try {
    const bmp = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
    return { fonte: bmp, w: bmp.width, h: bmp.height, liberar: () => bmp.close() }
  } catch {
    /* segue para os fallbacks */
  }
  try {
    const bmp = await createImageBitmap(arquivo)
    return { fonte: bmp, w: bmp.width, h: bmp.height, liberar: () => bmp.close() }
  } catch {
    /* segue para o <img> */
  }
  const url = URL.createObjectURL(arquivo)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return { fonte: img, w: img.naturalWidth, h: img.naturalHeight, liberar: () => URL.revokeObjectURL(url) }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}

async function reduzir(dec: Decodificada, maxLado: number, qualidade: number) {
  const escala = Math.min(1, maxLado / Math.max(dec.w, dec.h))
  const w = Math.max(1, Math.round(dec.w * escala))
  const h = Math.max(1, Math.round(dec.h * escala))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(dec.fonte, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', qualidade))
  if (!blob) throw new Error('compressao')
  return { blob, w, h }
}

async function enviarBlob(url: string, blob: Blob) {
  const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob })
  if (!r.ok) throw new Error(`armazenamento ${r.status}`)
}

const json = { 'Content-Type': 'application/json' }

export default function SecaoFotos({ inicial }: { inicial: Foto[] }) {
  const [fotos, setFotos] = useState<Foto[]>(inicial)
  const [aberta, setAberta] = useState<number | null>(null)
  const [status, setStatus] = useState<{ texto: string; erro: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)

  async function enviarUma(arquivo: File) {
    const dec = await decodificar(arquivo)
    try {
      const grande = await reduzir(dec, 1800, 0.84)
      const mini = await reduzir(dec, 480, 0.8)

      const r1 = await fetch('/api/fotos/upload-url', { method: 'POST' })
      if (!r1.ok) throw new Error('upload-url')
      const { id, urlFull, urlThumb } = await r1.json()

      await enviarBlob(urlFull, grande.blob)
      await enviarBlob(urlThumb, mini.blob)

      const r2 = await fetch('/api/fotos', {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ id, legenda: '', largura: grande.w, altura: grande.h }),
      })
      if (!r2.ok) throw new Error('registro')
      const d = await r2.json()
      setFotos(d.fotos)
    } finally {
      dec.liberar()
    }
  }

  async function importar(lista: FileList | null) {
    if (!lista || !lista.length) return
    const arquivos = Array.from(lista)
    setEnviando(true)
    let enviadas = 0
    let falhas = 0
    for (let i = 0; i < arquivos.length; i++) {
      setStatus({ texto: `Enviando foto ${i + 1} de ${arquivos.length}…`, erro: false })
      try {
        await enviarUma(arquivos[i])
        enviadas++
      } catch (e) {
        console.error(e)
        falhas++
      }
    }
    setEnviando(false)
    if (entrada.current) entrada.current.value = ''
    if (falhas === 0) {
      setStatus({ texto: enviadas === 1 ? 'Foto guardada.' : `${enviadas} fotos guardadas.`, erro: false })
    } else {
      setStatus({
        texto: `${falhas} ${falhas === 1 ? 'foto não foi enviada' : 'fotos não foram enviadas'}. Confira o CORS do bucket e as chaves do R2.`,
        erro: true,
      })
    }
  }

  const fechar = useCallback(() => setAberta(null), [])

  async function remover(foto: Foto) {
    if (!window.confirm('Remover esta foto para sempre?')) return
    const r = await fetch(`/api/fotos/${foto.id}`, { method: 'DELETE' })
    if (!r.ok) {
      setStatus({ texto: 'Não foi possível remover a foto.', erro: true })
      return
    }
    setFotos((atual) => atual.filter((f) => f.id !== foto.id))
    setAberta(null)
  }

  async function salvarLegenda(foto: Foto, legenda: string) {
    if (legenda === foto.legenda) return
    const r = await fetch(`/api/fotos/${foto.id}`, { method: 'PATCH', headers: json, body: JSON.stringify({ legenda }) })
    if (r.ok) setFotos((atual) => atual.map((f) => (f.id === foto.id ? { ...f, legenda } : f)))
  }

  return (
    <section className="secao" aria-label="Fotos">
      <h2 className="secao-titulo">Nossas fotos</h2>
      <p className="secao-sub">Cada foto guardada aqui só aparece para vocês dois.</p>

      <div className="acoes">
        <label className="botao" style={{ cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.6 : 1 }}>
          <IconeCamera />
          {enviando ? 'Enviando…' : 'Importar fotos'}
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={enviando}
            onChange={(e) => importar(e.target.files)}
          />
        </label>
      </div>

      <p className={`aviso${status?.erro ? ' erro' : ''}`} role="status">
        {status?.texto}
      </p>

      {fotos.length === 0 ? (
        <p className="vazio">Ainda não há fotos. Toque em “Importar fotos” e escolha as primeiras da galeria.</p>
      ) : (
        <div className="polaroids">
          {fotos.map((f, i) => (
            <button key={f.id} type="button" className="polaroid" onClick={() => setAberta(i)} aria-label={f.legenda || 'Abrir foto'}>
              <img
                src={f.urlThumb}
                alt={f.legenda}
                loading="lazy"
                style={f.largura && f.altura ? { aspectRatio: `${f.largura} / ${f.altura}` } : undefined}
              />
              <span className="legenda">{f.legenda}</span>
            </button>
          ))}
        </div>
      )}

      {aberta !== null && fotos[aberta] && (
        <Visualizador
          fotos={fotos}
          indice={aberta}
          onIndice={setAberta}
          onFechar={fechar}
          onRemover={remover}
          onLegenda={salvarLegenda}
        />
      )}
    </section>
  )
}

function Visualizador({
  fotos,
  indice,
  onIndice,
  onFechar,
  onRemover,
  onLegenda,
}: {
  fotos: Foto[]
  indice: number
  onIndice: (i: number) => void
  onFechar: () => void
  onRemover: (f: Foto) => void
  onLegenda: (f: Foto, legenda: string) => void
}) {
  const foto = fotos[indice]
  const inicioX = useRef<number | null>(null)

  const anterior = useCallback(() => onIndice((indice - 1 + fotos.length) % fotos.length), [indice, fotos.length, onIndice])
  const proxima = useCallback(() => onIndice((indice + 1) % fotos.length), [indice, fotos.length, onIndice])

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
      else if (e.key === 'ArrowLeft') anterior()
      else if (e.key === 'ArrowRight') proxima()
    }
    window.addEventListener('keydown', aoTeclar)
    const anteriorOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = anteriorOverflow
    }
  }, [anterior, proxima, onFechar])

  return (
    <div className="visualizador" role="dialog" aria-modal="true" aria-label="Foto">
      <div className="topo">
        <button type="button" className="link perigo" onClick={() => onRemover(foto)}>
          Remover foto
        </button>
        <button type="button" className="botao-suave" onClick={onFechar}>
          Fechar
        </button>
      </div>

      <div
        className="palco"
        onTouchStart={(e) => (inicioX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (inicioX.current === null || fotos.length < 2) return
          const dx = e.changedTouches[0].clientX - inicioX.current
          inicioX.current = null
          if (dx > 55) anterior()
          else if (dx < -55) proxima()
        }}
      >
        <img src={foto.urlFull} alt={foto.legenda} />
        {fotos.length > 1 && (
          <>
            <button type="button" className="seta ant" onClick={anterior} aria-label="Foto anterior">
              ‹
            </button>
            <button type="button" className="seta prox" onClick={proxima} aria-label="Próxima foto">
              ›
            </button>
          </>
        )}
      </div>

      <div className="rodape">
        <input
          key={foto.id}
          className="campo"
          defaultValue={foto.legenda}
          placeholder="Escreva uma legenda"
          maxLength={200}
          aria-label="Legenda da foto"
          onBlur={(e) => onLegenda(foto, e.target.value.trim())}
        />
      </div>
    </div>
  )
}
