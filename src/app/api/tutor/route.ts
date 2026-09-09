import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluatePrompt } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // Obter prompt do body
    const body = await request.json()
    const { prompt, instructions, hints } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt inválido ou vazio.' },
        { status: 400 }
      )
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt muito longo. Máximo de 2000 caracteres.' },
        { status: 400 }
      )
    }

    // Avaliar prompt
    const evaluation = await evaluatePrompt(prompt.trim(), { instructions, hints })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('[/api/tutor] Erro:', error)
    const message = error instanceof Error ? error.message : 'Erro interno do servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
