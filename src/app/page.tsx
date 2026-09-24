import Painel from '@/components/Painel'
import TelaPin from '@/components/TelaPin'
import { sessaoValida } from '@/lib/auth'
import { listarCuriosidades, listarEventos, listarFotos, listarMomentos, listarPontosMapa, listarViagens } from '@/lib/dados'
import { getConfig } from '@/lib/db'
import { faltandoEssenciais } from '@/lib/env'

export const dynamic = 'force-dynamic'

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="tela">
      <div className="config-pendente">
        <h2 className="secao-titulo" style={{ fontSize: '2.2rem' }}>
          {titulo}
        </h2>
        {children}
      </div>
    </main>
  )
}

export default async function Home() {
  const faltando = faltandoEssenciais()
  if (faltando.length) {
    return (
      <Aviso titulo="Falta configurar">
        <p>Defina estas variáveis de ambiente e reinicie:</p>
        <p>
          {faltando.map((f) => (
            <code key={f} style={{ display: 'block' }}>
              {f}
            </code>
          ))}
        </p>
      </Aviso>
    )
  }

  try {
    if (!(await sessaoValida())) {
      const temPin = Boolean(await getConfig('pin_hash'))
      return <TelaPin temPin={temPin} />
    }
    const [fotos, momentos, eventos, viagens, pontosMapa, curiosidades] = await Promise.all([
      listarFotos(),
      listarMomentos(),
      listarEventos(),
      listarViagens(),
      listarPontosMapa(),
      listarCuriosidades(),
    ])
    return (
      <Painel
        fotos={fotos}
        momentos={momentos}
        eventos={eventos}
        viagens={viagens}
        pontosMapa={pontosMapa}
        curiosidades={curiosidades}
      />
    )
  } catch (e) {
    console.error('Erro ao abrir o app:', e)
    const msg = e instanceof Error ? e.message : ''
    return (
      <Aviso titulo="Não foi possível abrir">
        <p>Confira a conexão com o banco (DATABASE_URL) e as variáveis do armazenamento (R2_*).</p>
        {msg.startsWith('Variavel de ambiente ausente') && <p><code>{msg}</code></p>}
      </Aviso>
    )
  }
}
