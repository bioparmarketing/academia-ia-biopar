import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[/api/progress] Não autenticado:', authError)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const { module_id, course_id, status, score } = body

    if (!module_id || !course_id || !status) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    // Usar admin client para garantir gravação e contornar restrições de permissão RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verificar se já existe registro
    const { data: existing, error: selectError } = await adminSupabase
      .from('user_progress')
      .select('id, status')
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/progress] Exceção:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
