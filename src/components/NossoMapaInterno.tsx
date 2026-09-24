'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import type { PontoMapa } from '@/lib/tipos'
import { CAMINHO_CORACAO } from './Icones'

const json = { 'Content-Type': 'application/json' }

const iconeCoracao = L.divIcon({
  className: 'pino-coracao',
  html: `<svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><path d="${CAMINHO_CORACAO}" fill="#ff4f7b" stroke="#fff5f3" stroke-width="0.9"/></svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 27],
  popupAnchor: [0, -24],
})

function formatarData(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CliquesNoMapa({ onClique }: { onClique: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClique(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function NossoMapaInterno({ inicial }: { inicial: PontoMapa[] }) {
  const [pontos, setPontos] = useState<PontoMapa[]>(inicial)
  const [pendente, setPendente] = useState<{ lat: number; lng: number } | null>(null)
  const [local, setLocal] = useState('')
  const [data, setData] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  // So calculado uma vez: o mapa nao deve "pular" toda vez que um ponto novo e adicionado.
  const centro = useMemo<[number, number]>(() => {
    if (inicial.length) return [inicial[0].latitude, inicial[0].longitude]
    return [-14.235, -51.9253] // centro aproximado do Brasil
  }, [inicial])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!pendente) return
    setOcupado(true)
    setErro('')
    try {
      const r = await fetch('/api/mapa', {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ latitude: pendente.lat, longitude: pendente.lng, local, data }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setPontos(d.pontos)
      setPendente(null)
      setLocal('')
      setData('')
    } catch {
      setErro('Não foi possível guardar. Tente de novo.')
    }
    setOcupado(false)
  }

  async function remover(id: string) {
    if (!window.confirm('Remover este coração do mapa?')) return
    const r = await fetch(`/api/mapa/${id}`, { method: 'DELETE' })
    if (r.ok) setPontos((atual) => atual.filter((p) => p.id !== id))
  }

  return (
    <div className="mapa-wrap">
      <MapContainer
        center={centro}
        zoom={pontos.length ? 4 : 3}
        scrollWheelZoom
        worldCopyJump
        style={{ height: '58vh', minHeight: 320, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        <CliquesNoMapa onClique={(lat, lng) => setPendente({ lat, lng })} />
        {pontos.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={iconeCoracao}>
            <Popup>
              <strong>{p.local || 'Um lugar nosso'}</strong>
              {p.data && <div>{formatarData(p.data)}</div>}
              <div style={{ marginTop: 6 }}>
                <button type="button" onClick={() => remover(p.id)}>
                  Remover
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {pendente && (
        <form className="form mapa-form" onSubmit={salvar}>
          <p className="secao-sub" style={{ margin: '0 0 6px' }}>
            Novo coração neste ponto
          </p>
          <input className="campo" placeholder="Nome do lugar (opcional)" value={local} maxLength={150} autoFocus onChange={(e) => setLocal(e.target.value)} aria-label="Nome do lugar" />
          <input className="campo" type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data (opcional)" />
          <div className="acoes" style={{ marginBottom: 0 }}>
            <button type="submit" className="botao" disabled={ocupado}>
              {ocupado ? 'Guardando…' : 'Marcar aqui'}
            </button>
            <button type="button" className="botao-suave" onClick={() => setPendente(null)} disabled={ocupado}>
              Cancelar
            </button>
          </div>
          <p className="aviso erro" role="status">
            {erro}
          </p>
        </form>
      )}
    </div>
  )
}
