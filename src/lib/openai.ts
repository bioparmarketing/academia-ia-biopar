import OpenAI from 'openai'
import type { TutorEvaluation } from './types'

// ============================================================
// Prompt do Tutor IA
// ============================================================
const TUTOR_SYSTEM_PROMPT = `Você é o Tutor de IA da Academia de IA BioPar.

Seu papel é ensinar colaboradores a utilizar inteligência artificial de forma eficiente, crítica e responsável.

Ao avaliar um exercício:
1. Identifique o que o aluno fez corretamente
2. Identifique informações importantes que faltaram
3. Explique de maneira curta e didática
4. Incentive uma nova tentativa quando houver oportunidade de melhoria
5. Não reescreva imediatamente todo o exercício pelo aluno
6. Seja claro, objetivo e didático
7. Não invente referências, números ou evidências
8. Quando a atividade envolver pesquisa científica, diferencie espécie, cepa/isolado e produto comercial
9. Não permita que resultados de uma espécie sejam automaticamente atribuídos a uma cepa específica ou produto
10. Priorize aprendizagem em vez de simplesmente fornecer respostas

Você deve avaliar o prompt do aluno em 4 critérios:
- objective: o aluno definiu claramente o que quer obter?
- context: o aluno forneceu contexto suficiente (área, cultura, objetivo)?
- sources: o aluno especificou o tipo de fonte ou período?
- output_format: o aluno indicou o formato desejado (tópicos, tabela, resumo, etc.)?

Responda SEMPRE em JSON válido com este formato exato:
{
  "objective": boolean,
  "context": boolean,
  "sources": boolean,
  "output_format": boolean,
  "score": number entre 0 e 100,
  "feedback": "mensagem didática em português",
  "missing": ["lista de itens que faltaram"],
  "can_continue": boolean (true se score >= 75)
}`

export interface EvaluationContext {
  instructions?: string
  hints?: string[]
}

// ============================================================
// Modo MOCK para desenvolvimento sem OpenAI
// ============================================================
function getMockEvaluation(prompt: string, context?: EvaluationContext): TutorEvaluation {
  const lower = prompt.toLowerCase()
  
  // Objetivo: verbos de ação e clareza de intenção
  const objectiveKeywords = [
    'pesquisa', 'resumo', 'análise', 'analise', 'quero', 'estruture',
    'elabore', 'crie', 'compare', 'avalie', 'liste', 'identifique',
    'extraia', 'descreva', 'organize', 'explique', 'desenvolva', 'proponha'
  ]
  const hasObjective = objectiveKeywords.some((k) => lower.includes(k)) || prompt.trim().split(/\s+/).length >= 8

  // Contexto: termos agro/bioparque ou descrição com tamanho suficiente
  const contextKeywords = [
    'soja', 'milho', 'agrícola', 'agricola', 'cultura', 'bacillus',
    'microrganismo', 'bio', 'pdi', 'ensaio', 'fung', 'praga', 'inoculante',
    'planta', 'campo', 'fitossanit', 'doenç', 'dose', 'eficácia', 'eficacia',
    'cepa', 'isolado', 'experimento', 'laboratório', 'laboratorio', 'bioinsumo'
  ]
  const hasContext = contextKeywords.some((k) => lower.includes(k)) || prompt.length > 70

  // Fontes, critérios, limites ou período
  const sourcesKeywords = [
    'artigo', 'científic', 'cientific', 'fonte', 'anos', 'referência',
    'referencia', 'base', 'critério', 'criterio', 'regras', 'metodologia',
    'periódico', 'periodico', 'pubmed', 'dados', 'laudo', 'relatório',
    'relatorio', 'evidência', 'evidencia', 'exemplo', 'protocolo', 'documento',
    'parâmetro', 'parametro', 'premissa', 'restrição', 'restricao'
  ]
  const hintsMatch = context?.hints && context.hints.some((h) => lower.includes(h.toLowerCase()))
  const hasSources = sourcesKeywords.some((k) => lower.includes(k)) || Boolean(hintsMatch) || prompt.length > 90

  // Formato da resposta
  const formatKeywords = [
    'tópico', 'topico', 'tabela', 'resumo', 'lista', 'formato', 'seç',
    'sec', 'item', 'bullet', 'passo a passo', 'json', 'markdown', 'estrutura'
  ]
  const hasFormat =
    formatKeywords.some((k) => lower.includes(k)) ||
    prompt.includes('- ') ||
    prompt.includes('1.') ||
    prompt.includes('\n')

  const score = [hasObjective, hasContext, hasSources, hasFormat].filter(Boolean).length * 25
  const missing: string[] = []

  if (!hasObjective) missing.push('Objetivo claro do pedido')
  if (!hasContext) missing.push('Contexto prático ou premissas')
  if (!hasSources) missing.push('Tipo de fonte, critérios ou regras a priorizar')
  if (!hasFormat) missing.push('Formato desejado da resposta (ex: tópicos, tabela, resumo)')

  let feedback = ''
  if (score >= 75) {
    feedback = 'Excelente! Seu prompt está muito bem estruturado, específico e atende às boas práticas do exercício.'
  } else if (score >= 50) {
    feedback = `Bom progresso! Você cobriu pontos importantes. Para deixá-lo ainda mais assertivo, inclua: ${missing.slice(0, 2).join(' e ')}.`
  } else {
    feedback = `Seu prompt precisa de mais detalhes para guiar a IA. Tente especificar: objetivo claro, contexto/premissas, critérios de checagem e o formato de saída esperado.`
  }

  return {
    objective: hasObjective,
    context: hasContext,
    sources: hasSources,
    output_format: hasFormat,
    score,
    feedback,
    missing,
    can_continue: score >= 75,
  }
}

// ============================================================
// Avaliação real via OpenAI
// ============================================================
async function getOpenAIEvaluation(
  prompt: string,
  context?: EvaluationContext
): Promise<TutorEvaluation> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const userContent = context?.instructions
    ? `Exercício proposto: "${context.instructions}"\nDicas esperadas: ${context.hints?.join(', ') || 'N/A'}\n\nPrompt enviado pelo aluno para avaliação:\n"${prompt}"`
    : `Avalie o seguinte prompt do aluno:\n\n"${prompt}"`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: TUTOR_SYSTEM_PROMPT },
      {
        role: 'user',
        content: userContent,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 800,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Resposta vazia da OpenAI')
  }

  const parsed = JSON.parse(content) as TutorEvaluation
  return parsed
}

// ============================================================
// Função principal exportada
// ============================================================
export async function evaluatePrompt(
  userPrompt: string,
  context?: EvaluationContext
): Promise<TutorEvaluation> {
  const isMockMode = process.env.AI_MOCK_MODE === 'true'

  if (isMockMode) {
    // Simular um pequeno delay para parecer realista
    await new Promise((resolve) => setTimeout(resolve, 800))
    return getMockEvaluation(userPrompt, context)
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada. Defina AI_MOCK_MODE=true para desenvolvimento.')
  }

  try {
    return await getOpenAIEvaluation(userPrompt, context)
  } catch (error) {
    if (error instanceof Error) {
      // Erros específicos da OpenAI
      if (error.message.includes('rate limit')) {
        throw new Error('Limite de requisições atingido. Tente novamente em alguns segundos.')
      }
      if (error.message.includes('timeout')) {
        throw new Error('Tempo esgotado ao conectar com o Tutor IA. Tente novamente.')
      }
    }
    throw new Error('Tutor IA temporariamente indisponível. Tente novamente.')
  }
}
