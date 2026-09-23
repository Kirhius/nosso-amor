'use client'

import { CONFIG } from '@/lib/config'
import type { Autor } from '@/lib/tipos'
import Cabecalho from './Cabecalho'
import { Coracao } from './Icones'

export default function EscolherAutor({ onEscolher }: { onEscolher: (autor: Autor) => void }) {
  return (
    <main className="tela">
      <Cabecalho />
      <div className="cartao-pin">
        <p className="instrucao">
          Quem está usando este aparelho? Assim conseguimos avisar um ao outro quando algo novo for adicionado.
        </p>
        <div className="acoes-empilhadas">
          <button type="button" className="botao" onClick={() => onEscolher('ele')}>
            <Coracao cheio /> Sou o {CONFIG.nomeEle}
          </button>
          <button type="button" className="botao" onClick={() => onEscolher('ela')}>
            <Coracao cheio /> Sou a {CONFIG.nomeEla}
          </button>
        </div>
        <p className="vazio" style={{ padding: '18px 4px 0' }}>
          Isso fica guardado só neste aparelho, e não pede senha.
        </p>
      </div>
    </main>
  )
}
