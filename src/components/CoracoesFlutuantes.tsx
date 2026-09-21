'use client'

import { useEffect, useRef } from 'react'

type Item = {
  x: number
  y: number
  tam: number
  vx: number
  vy: number
  fase: number
  amp: number
  freq: number
  rot: number
  vrot: number
  cor: string
  alfaMax: number
  vida: number // so para os coracoes de toque (1 -> 0)
  toque: boolean
}

const CORES = ['255,122,156', '255,178,199', '232,93,127', '255,215,225', '230,185,138']
const MAXIMO = 90

function desenhar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, cor: string, alfa: number) {
  if (alfa <= 0.005) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.translate(0, -s * 0.5)
  ctx.beginPath()
  ctx.moveTo(0, s * 0.3)
  ctx.bezierCurveTo(0, -s * 0.05, -s * 0.55, -s * 0.05, -s * 0.55, s * 0.3)
  ctx.bezierCurveTo(-s * 0.55, s * 0.62, -s * 0.15, s * 0.78, 0, s * 0.98)
  ctx.bezierCurveTo(s * 0.15, s * 0.78, s * 0.55, s * 0.62, s * 0.55, s * 0.3)
  ctx.bezierCurveTo(s * 0.55, -s * 0.05, 0, -s * 0.05, 0, s * 0.3)
  ctx.closePath()
  ctx.fillStyle = `rgba(${cor},${alfa})`
  ctx.fill()
  ctx.restore()
}

export default function CoracoesFlutuantes() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let ultimo = performance.now()
    let t = 0
    let itens: Item[] = []

    const alvo = () => (reduzido ? 7 : Math.max(10, Math.min(26, Math.round(w / 26))))

    const novo = (inicial: boolean): Item => {
      const tam = 10 + Math.random() * 22
      return {
        x: Math.random() * w,
        y: inicial ? Math.random() * h : h + tam * 1.5,
        tam,
        vx: 0,
        vy: reduzido ? 0 : -(14 + Math.random() * 26) * (tam / 26 + 0.45),
        fase: Math.random() * Math.PI * 2,
        amp: reduzido ? 0 : 6 + Math.random() * 22,
        freq: 0.4 + Math.random() * 0.7,
        rot: (Math.random() - 0.5) * 0.8,
        vrot: reduzido ? 0 : (Math.random() - 0.5) * 0.4,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        alfaMax: 0.12 + Math.random() * 0.3,
        vida: 1,
        toque: false,
      }
    }

    const ajustar = () => {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const normais = itens.filter((i) => !i.toque)
      const falta = alvo() - normais.length
      if (falta > 0) for (let i = 0; i < falta; i++) itens.push(novo(true))
      else if (falta < 0) {
        let sobra = -falta
        itens = itens.filter((i) => (i.toque ? true : sobra-- <= 0))
      }
      if (reduzido) quadro(0)
    }

    const explodir = (x: number, y: number) => {
      if (reduzido) return
      const qtd = 7
      for (let i = 0; i < qtd && itens.length < MAXIMO; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
        const vel = 60 + Math.random() * 110
        itens.push({
          x,
          y,
          tam: 9 + Math.random() * 15,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel,
          fase: 0,
          amp: 0,
          freq: 0,
          rot: (Math.random() - 0.5) * 0.9,
          vrot: (Math.random() - 0.5) * 1.2,
          cor: CORES[Math.floor(Math.random() * CORES.length)],
          alfaMax: 0.75,
          vida: 1,
          toque: true,
        })
      }
    }

    const quadro = (dt: number) => {
      t += dt
      ctx.clearRect(0, 0, w, h)
      const arrasto = Math.pow(0.35, dt)
      const proximos: Item[] = []
      for (const c of itens) {
        let alfa: number
        let x: number
        if (c.toque) {
          c.vx *= arrasto
          c.vy *= arrasto
          c.x += c.vx * dt
          c.y += c.vy * dt
          c.vida -= dt / 1.7
          if (c.vida <= 0) continue
          alfa = c.alfaMax * c.vida
          x = c.x
        } else {
          c.y += c.vy * dt
          if (c.y < -c.tam * 1.5 && !reduzido) {
            proximos.push(novo(false))
            continue
          }
          const fade = reduzido ? 1 : Math.max(0, Math.min(1, (h - c.y) / (h * 0.12), c.y / (h * 0.2)))
          alfa = c.alfaMax * fade
          x = c.x + Math.sin(c.fase + t * c.freq) * c.amp
        }
        c.rot += c.vrot * dt
        desenhar(ctx, x, c.y, c.tam, c.rot, c.cor, alfa)
        proximos.push(c)
      }
      itens = proximos
    }

    const laco = (agora: number) => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000)
      ultimo = agora
      quadro(dt)
      raf = requestAnimationFrame(laco)
    }

    const aoTocar = (e: PointerEvent) => explodir(e.clientX, e.clientY)

    ajustar()
    window.addEventListener('resize', ajustar)
    if (!reduzido) {
      window.addEventListener('pointerdown', aoTocar)
      raf = requestAnimationFrame(laco)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', ajustar)
      window.removeEventListener('pointerdown', aoTocar)
    }
  }, [])

  return <canvas ref={ref} className="canvas-coracoes" aria-hidden="true" />
}
