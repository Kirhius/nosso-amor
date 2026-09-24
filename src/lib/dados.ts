import { db } from './db'
import { chaveFull, chaveThumb, urlLeitura } from './r2'
import type { Foto, Momento, Curiosidade, Autor, Viagem, Evento, PontoMapa, PerguntaQuiz } from './tipos'

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
                         FROM momentos ORDER BY data DESC, criado_em DESC`
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

export async function listarViagens(): Promise<Viagem[]> {
  const q = await db()
  const linhas = await q`SELECT id, local, to_char(data, 'YYYY-MM-DD') AS data
                         FROM viagens ORDER BY data DESC, criada_em DESC`
  return linhas.map((l) => ({ id: String(l.id), local: String(l.local), data: String(l.data) }))
}

export async function listarEventos(): Promise<Evento[]> {
  const q = await db()
  const linhas = await q`SELECT id, titulo, tipo, to_char(data, 'YYYY-MM-DD') AS data, observacao
                         FROM eventos ORDER BY data ASC, criado_em ASC`
  return linhas.map((l) => ({
    id: String(l.id),
    titulo: String(l.titulo),
    tipo: String(l.tipo) as Evento['tipo'],
    data: String(l.data),
    observacao: String(l.observacao),
  }))
}

export async function listarPontosMapa(): Promise<PontoMapa[]> {
  const q = await db()
  const linhas = await q`SELECT id, latitude, longitude, local, to_char(data, 'YYYY-MM-DD') AS data
                         FROM mapa_pontos ORDER BY criado_em ASC`
  return linhas.map((l) => ({
    id: String(l.id),
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    local: String(l.local),
    data: l.data ? String(l.data) : '',
  }))
}

/** Lista o quiz do ponto de vista de "para" (quem esta olhando): esconde a opcao correta
 *  de perguntas feitas pelo outro que "para" ainda nao respondeu, para nao estragar a surpresa. */
export async function listarQuizPara(para: Autor): Promise<PerguntaQuiz[]> {
  const q = await db()
  const linhas = await q`SELECT id, autor_criador, pergunta, opcoes, opcao_correta, opcao_respondida, respondida_em, criado_em
                         FROM quiz_perguntas ORDER BY criado_em DESC`
  return linhas.map((l) => {
    const autorCriador = String(l.autor_criador) as Autor
    const respondida = l.respondida_em !== null
    const podeVerCorreta = autorCriador === para || respondida
    const opcaoCorreta = Number(l.opcao_correta)
    const opcaoRespondida = l.opcao_respondida === null || l.opcao_respondida === undefined ? null : Number(l.opcao_respondida)
    const opcoesBrutas = l.opcoes
    const opcoes: string[] = Array.isArray(opcoesBrutas) ? opcoesBrutas : JSON.parse(String(opcoesBrutas))
    return {
      id: String(l.id),
      autorCriador,
      pergunta: String(l.pergunta),
      opcoes,
      opcaoCorreta: podeVerCorreta ? opcaoCorreta : -1,
      respondida,
      opcaoRespondida,
      acertou: respondida ? opcaoRespondida === opcaoCorreta : null,
      criadaEm: String(l.criado_em),
    }
  })
}
