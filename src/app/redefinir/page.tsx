import FormRedefinir from '@/components/FormRedefinir'
import Cabecalho from '@/components/Cabecalho'

export const dynamic = 'force-dynamic'

export default async function Redefinir({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return (
      <main className="tela">
        <Cabecalho />
        <div className="cartao-pin">
          <p className="instrucao">Este link não é válido. Peça um novo em “Esqueci o PIN”.</p>
          <a className="botao" href="/">
            Voltar
          </a>
        </div>
      </main>
    )
  }
  return <FormRedefinir token={token} />
}
