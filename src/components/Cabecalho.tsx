import { CONFIG } from '@/lib/config'
import { Coracao } from './Icones'

export default function Cabecalho() {
  return (
    <header>
      <h1 className="titulo">{CONFIG.titulo}</h1>
      <div className="fio" aria-hidden="true">
        <Coracao cheio />
      </div>
    </header>
  )
}
