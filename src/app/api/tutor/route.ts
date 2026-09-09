import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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
    const { prompt, instructions, hints, activity_id } = body

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

    // Avaliar prompt com Tutor IA
    const evaluation = await evaluatePrompt(prompt.trim(), { instructions, hints })

    // Registrar o prompt do aluno, a nota e o feedback em activity_attempts para relatórios
    if (activity_id && typeof activity_id === 'string' && activity_id.length === 36) {
      try {
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        )

        const { count } = await adminSupabase
          .from('activity_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('activity_id', activity_id)

        const attemptNumber = (count ?? 0) + 1

        await adminSupabase.from('activity_attempts').insert({
          user_id: user.id,
          activity_id,
          answer: prompt.trim(),
          score: evaluation.score,
          feedback: evaluation.feedback,
          attempt_number: attemptNumber,
        })
      } catch (saveErr) {
        console.error('[/api/tutor] Erro ao gravar tentativa com o prompt:', saveErr)
      }
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('[/api/tutor] Erro:', error)
    const message = error instanceof Error ? error.message : 'Erro interno do servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
