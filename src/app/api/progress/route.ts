import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const { module_id, course_id, status, score } = body

    if (!module_id || !course_id || !status) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    // Verificar se já existe registro
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('module_id', module_id)
      .single()

    const now = new Date().toISOString()

    if (existing) {
      // Atualizar apenas se o novo status for mais avançado
      const statusOrder = { not_started: 0, in_progress: 1, completed: 2 }
      const currentOrder = statusOrder[existing.status as keyof typeof statusOrder] ?? 0
      const newOrder = statusOrder[status as keyof typeof statusOrder] ?? 0

      if (newOrder > currentOrder) {
        const updateData: Record<string, unknown> = { status }
        if (status === 'in_progress' && !existing) updateData.started_at = now
        if (status === 'completed') {
          updateData.completed_at = now
          if (score !== undefined) updateData.score = score
        }

        await supabase
          .from('user_progress')
          .update(updateData)
          .eq('id', existing.id)
      }
    } else {
      // Criar novo registro
      const insertData: Record<string, unknown> = {
        user_id: user.id,
        course_id,
        module_id,
        status,
        started_at: status !== 'not_started' ? now : null,
        completed_at: status === 'completed' ? now : null,
      }
      if (score !== undefined) insertData.score = score

      await supabase.from('user_progress').insert(insertData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/progress] Erro:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
