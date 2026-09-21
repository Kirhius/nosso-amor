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

export type Autor = 'ele' | 'ela'

export type Curiosidade = {
  id: string
  texto: string
  autor: Autor
}
