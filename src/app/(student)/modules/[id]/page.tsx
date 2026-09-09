import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModuleViewer from '@/components/module/ModuleViewer'
import type { Module } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModulePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar módulo
  const { data: module, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !module) {
    redirect('/')
  }

  // Buscar atividades do módulo
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('module_id', id)
    .order('sequence')

  // Buscar progresso atual
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', id)
    .single()

  // Verificar se módulo está disponível (primeiro módulo ou anterior concluído)
  const { data: allModules } = await supabase
    .from('modules')
    .select('id, number')
    .eq('course_id', module.course_id)
    .eq('active', true)
    .order('number')

  if (allModules && module.number > 1) {
    const prevModule = allModules.find((m) => m.number === module.number - 1)
    if (prevModule) {
      const { data: prevProgress } = await supabase
        .from('user_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('module_id', prevModule.id)
        .single()

      if (prevProgress?.status !== 'completed') {
        redirect('/')
      }
    }
  }

  // Buscar curso
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', module.course_id)
    .single()

  return (
    <ModuleViewer
      module={module as Module}
      activities={activities ?? []}
      initialProgress={progress ?? null}
      courseId={course?.id ?? ''}
      userId={user.id}
    />
  )
}
