import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: progress, error: progError } = await adminSupabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (progError) {
      return NextResponse.json({ error: progError.message }, { status: 500 })
    }

    return NextResponse.json({
      progress,
      last_active_module_id: user.user_metadata?.last_active_module_id ?? null,
      module_steps: user.user_metadata?.module_steps ?? {},
    })
  } catch (error) {
    console.error('[/api/progress GET] Exceção:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[/api/progress] Não autenticado:', authError)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const { module_id, course_id, status, score, step, activity_id, answer, feedback } = body

    if (!module_id || !course_id || !status) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    // Usar admin client para garantir gravação com service role
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verificar se já existe registro na tabela user_progress
    const { data: existing, error: selectError } = await adminSupabase
      .from('user_progress')
      .select('id, status, score')
      .eq('user_id', user.id)
      .eq('module_id', module_id)
      .maybeSingle()

    if (selectError) {
      console.error('[/api/progress] Erro ao buscar progresso existente:', selectError)
    }

    const now = new Date().toISOString()

    if (existing) {
      const statusOrder = { not_started: 0, in_progress: 1, completed: 2 }
      const currentOrder = statusOrder[existing.status as keyof typeof statusOrder] ?? 0
      const newOrder = statusOrder[status as keyof typeof statusOrder] ?? 0

      // Só atualiza se o novo status for maior ou igual ao atual
      if (newOrder >= currentOrder) {
        const updateData: Record<string, unknown> = { status }
        if (status === 'completed') {
          updateData.completed_at = now
          if (score !== undefined) updateData.score = score
        }

        const { error: updateError } = await adminSupabase
          .from('user_progress')
          .update(updateData)
          .eq('id', existing.id)

        if (updateError) {
          console.error('[/api/progress] Erro no update:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
      }
    } else {
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        course_id,
        module_id,
        status,
        started_at: now,
        completed_at: status === 'completed' ? now : null,
      }
      if (score !== undefined) insertData.score = score

      const { error: insertError } = await adminSupabase
        .from('user_progress')
        .insert(insertData)

      if (insertError) {
        console.error('[/api/progress] Erro no insert:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    // Persistir o passo e o último módulo acessado no user_metadata
    try {
      const currentSteps = (user.user_metadata?.module_steps as Record<string, number> | undefined) || {}
      const updatedSteps = { ...currentSteps }
      if (typeof step === 'number') {
        updatedSteps[module_id] = step
      }

      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          last_active_module_id: module_id,
          module_steps: updatedSteps,
        },
      })
    } catch (metaErr) {
      console.error('[/api/progress] Erro ao atualizar user_metadata:', metaErr)
    }

    // Se houver activity_id válido, salvar em activity_attempts
    if (activity_id && typeof activity_id === 'string' && activity_id.length === 36) {
      try {
        await adminSupabase.from('activity_attempts').insert({
          user_id: user.id,
          activity_id,
          answer: answer ? String(answer) : status === 'completed' ? 'quiz_completed' : 'step_progress',
          score: typeof score === 'number' ? score : null,
          feedback: feedback ? String(feedback) : null,
          attempt_number: 1,
        })
      } catch (actErr) {
        console.error('[/api/progress] Erro ao gravar activity_attempts:', actErr)
      }
    }

    // Invalidar cache do Next.js instantaneamente
    try {
      revalidatePath('/', 'page')
      revalidatePath('/(student)', 'layout')
      revalidatePath('/admin', 'page')
      revalidatePath(`/admin/users/${user.id}`, 'page')
      revalidatePath(`/modules/${module_id}`, 'page')
    } catch (revErr) {
      console.error('[/api/progress] Erro no revalidatePath:', revErr)
    }

    return NextResponse.json({ success: true, status, score, step })
  } catch (error) {
    console.error('[/api/progress] Exceção:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
