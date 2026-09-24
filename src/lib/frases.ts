// Frases exibidas na tela inicial, uma por dia (a mesma o dia inteiro, trocando a meia-noite de Brasilia).
// O texto das passagens biblicas foi escrito com nossas proprias palavras (parafrase), citando a referencia.
// Se voces preferirem o texto exato de uma traducao especifica (NVI, ARA, etc.), substituam aqui.

export type Frase = { texto: string; fonte: string }

export const FRASES: Frase[] = [
  { texto: 'O amor é paciente, é bondoso; não guarda rancor e não desiste diante das dificuldades.', fonte: '1 Coríntios 13:4-7 (parafraseado)' },
  { texto: 'Acima de tudo, vistam-se de amor, que é o que une todas as coisas em perfeita harmonia.', fonte: 'Colossenses 3:14 (parafraseado)' },
  { texto: 'Amar o outro como a si mesmo resume o que realmente importa.', fonte: 'Marcos 12:31 (parafraseado)' },
  { texto: 'Onde há amor genuíno, o medo perde espaço.', fonte: '1 João 4:18 (parafraseado)' },
  { texto: 'Sejam pacientes um com o outro, e suportem-se com amor.', fonte: 'Efésios 4:2 (parafraseado)' },
  { texto: 'Duas pessoas juntas alcançam mais do que uma sozinha; uma ajuda a outra a se levantar.', fonte: 'Eclesiastes 4:9-10 (parafraseado)' },
  { texto: 'Amem-se de coração, um cuidando genuinamente do outro.', fonte: 'Romanos 12:10 (parafraseado)' },
  { texto: 'Que tudo o que vocês fizerem seja feito com amor.', fonte: '1 Coríntios 16:14 (parafraseado)' },
  { texto: 'Um cordão de três dobras não se rompe com facilidade — é assim quando Deus está no centro da relação.', fonte: 'Eclesiastes 4:12 (parafraseado)' },
  { texto: 'Vistam-se de compaixão, bondade, humildade, mansidão e paciência.', fonte: 'Colossenses 3:12 (parafraseado)' },
  { texto: 'Cuidar de quem se ama é a forma mais simples de amar de verdade.', fonte: 'Reflexão' },
  { texto: 'O amor não se mede pelo tamanho dos gestos, mas pela constância deles.', fonte: 'Reflexão' },
  { texto: 'Escolher o outro todos os dias é o que transforma um sentimento em uma história.', fonte: 'Reflexão' },
  { texto: 'A verdadeira intimidade nasce quando duas pessoas se sentem seguras para ser quem são.', fonte: 'Reflexão' },
  { texto: 'Amar é também ter paciência com o tempo do outro.', fonte: 'Reflexão' },
  { texto: 'Um relacionamento forte se constrói em pequenos cuidados diários, não em grandes momentos raros.', fonte: 'Reflexão' },
  { texto: 'A presença silenciosa de quem se importa vale mais do que muitas palavras.', fonte: 'Reflexão' },
  { texto: 'Cuidar do outro é uma forma de cuidar também de si mesmo.', fonte: 'Reflexão' },
  { texto: 'O respeito é a base sobre a qual o amor consegue durar.', fonte: 'Reflexão' },
  { texto: 'Gratidão pelo outro, dita em voz alta, fortalece qualquer vínculo.', fonte: 'Reflexão' },
]

/** Indice estavel por dia (fuso de Brasilia), para a frase nao mudar a cada recarregar a pagina. */
export function fraseDoDia(agoraMs: number = Date.now()): Frase {
  const brt = new Date(agoraMs - 3 * 3600_000)
  const diaAbsoluto = Math.floor(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate()) / 86400000)
  const indice = ((diaAbsoluto % FRASES.length) + FRASES.length) % FRASES.length
  return FRASES[indice]
}
