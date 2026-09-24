export type Foto = {
  id: string
  legenda: string
  largura: number
  altura: number
  urlFull: string
  urlThumb: string
}

export type Momento = {
  id: string
  titulo: string
  data: string // YYYY-MM-DD
  descricao: string
}

export type Viagem = {
  id: string
  local: string
  data: string // YYYY-MM-DD
}

export type TipoEvento = 'viagem' | 'show' | 'passeio' | 'churrasco' | 'jantar' | 'outro'

export type Evento = {
  id: string
  titulo: string
  tipo: TipoEvento
  data: string // YYYY-MM-DD
  observacao: string
}

export type PontoMapa = {
  id: string
  latitude: number
  longitude: number
  local: string
  data: string // YYYY-MM-DD, pode ser vazio
}

export type PerguntaQuiz = {
  id: string
  autorCriador: Autor
  pergunta: string
  opcoes: string[]
  opcaoCorreta: number
  respondida: boolean
  opcaoRespondida: number | null
  acertou: boolean | null
  criadaEm: string
}

export type Autor = 'ele' | 'ela'

export type Curiosidade = {
  id: string
  texto: string
  autor: Autor
}
