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

// ============================================================
// Modo MOCK para desenvolvimento sem OpenAI
// ============================================================
function getMockEvaluation(prompt: string): TutorEvaluation {
  const lower = prompt.toLowerCase()
  const hasObjective = lower.includes('pesquisa') || lower.includes('resumo') || lower.includes('análise') || lower.includes('quero')
  const hasContext = lower.includes('soja') || lower.includes('milho') || lower.includes('agrícola') || lower.includes('cultura') || lower.includes('bacillus') || lower.includes('microrganismo') || lower.length > 80
  const hasSources = lower.includes('artigo') || lower.includes('científic') || lower.includes('fonte') || lower.includes('anos')
  const hasFormat = lower.includes('tópico') || lower.includes('tabela') || lower.includes('resumo') || lower.includes('lista') || lower.includes('formato')

  const score = [hasObjective, hasContext, hasSources, hasFormat].filter(Boolean).length * 25
  const missing: string[] = []

  if (!hasObjective) missing.push('Objetivo claro do pedido')
  if (!hasContext) missing.push('Contexto (cultura, espécie ou área de aplicação)')
  if (!hasSources) missing.push('Tipo de fonte a priorizar (artigos, relatórios, período)')
  if (!hasFormat) missing.push('Formato desejado da resposta (tópicos, tabela, resumo)')

  let feedback = ''
  if (score >= 75) {
    feedback = 'Excelente! Seu prompt está bem estruturado. Você forneceu as informações essenciais para uma resposta de qualidade.'
  } else if (score >= 50) {
    feedback = `Bom começo! Você acertou alguns pontos importantes. Para melhorar, acrescente: ${missing.slice(0, 2).join(' e ')}.`
  } else {
    feedback = `Seu prompt precisa de mais detalhes. Tente incluir: objetivo claro, contexto da pesquisa, tipo de fonte preferida e o formato que espera receber.`
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
async function getOpenAIEvaluation(prompt: string): Promise<TutorEvaluation> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: TUTOR_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Avalie o seguinte prompt do aluno:\n\n"${prompt}"`,
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
export async function evaluatePrompt(userPrompt: string): Promise<TutorEvaluation> {
  const isMockMode = process.env.AI_MOCK_MODE === 'true'

  if (isMockMode) {
    // Simular um pequeno delay para parecer realista
    await new Promise((resolve) => setTimeout(resolve, 800))
    return getMockEvaluation(userPrompt)
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada. Defina AI_MOCK_MODE=true para desenvolvimento.')
  }

  try {
    return await getOpenAIEvaluation(userPrompt)
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
