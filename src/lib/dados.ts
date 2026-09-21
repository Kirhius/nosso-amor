import { db } from './db'
import { chaveFull, chaveThumb, urlLeitura } from './r2'
import type { Foto, Momento, Curiosidade, Autor } from './tipos'

export async function listarFotos(): Promise<Foto[]> {
  const q = await db()
  const linhas = await q`SELECT id, legenda, largura, altura FROM fotos ORDER BY criada_em DESC`
  return Promise.all(
    linhas.map(async (l) => ({
      id: String(l.id),
      legenda: String(l.legenda),
      largura: Number(l.largura),
      altura: Number(l.altura),
      urlFull: await urlLeitura(chaveFull(String(l.id))),
      urlThumb: await urlLeitura(chaveThumb(String(l.id))),
    })),
  )
}

export async function listarMomentos(): Promise<Momento[]> {
  const q = await db()
  const linhas = await q`SELECT id, titulo, to_char(data, 'YYYY-MM-DD') AS data, descricao
                         FROM momentos ORDER BY data ASC, criado_em ASC`
  return linhas.map((l) => ({
    id: String(l.id),
    titulo: String(l.titulo),
    data: String(l.data),
    descricao: String(l.descricao),
  }))
}

export async function listarCuriosidades(): Promise<Curiosidade[]> {
  const q = await db()
  const linhas = await q`SELECT id, texto, autor FROM curiosidades ORDER BY criada_em DESC`
  return linhas.map((l) => ({
    id: String(l.id),
    texto: String(l.texto),
    autor: (l.autor === 'ela' ? 'ela' : 'ele') as Autor,
  }))
}
