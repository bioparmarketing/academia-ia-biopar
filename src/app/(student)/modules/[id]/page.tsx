import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ModuleViewer from '@/components/module/ModuleViewer'
import type { Module } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModulePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Buscar módulo
  const { data: module, error } = await adminClient
    .from('modules')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !module) {
    redirect('/')
  }

  // Buscar atividades do módulo
  const { data: activities } = await adminClient
    .from('activities')
    .select('*')
    .eq('module_id', id)
    .order('sequence')

  // Buscar progresso atual do aluno neste módulo
  const { data: progress } = await adminClient
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', id)
    .maybeSingle()

  // Buscar todos os módulos ativos do curso para verificação de liberação e navegação
  const { data: allModules } = await adminClient
    .from('modules')
    .select('id, number, title')
    .eq('course_id', module.course_id)
    .eq('active', true)
    .order('number')

  // Verificar se o módulo está liberado (módulo 1 sempre liberado; módulo N requer que N-1 esteja 'completed')
  if (allModules && module.number > 1) {
    const prevModule = allModules.find((m) => m.number === module.number - 1)
    if (prevModule) {
      const { data: prevProgress } = await adminClient
        .from('user_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('module_id', prevModule.id)
        .maybeSingle()

      if (prevProgress?.status !== 'completed') {
        redirect('/')
      }
    }
  }

  // Buscar curso
  const { data: course } = await adminClient
    .from('courses')
    .select('id, title')
    .eq('id', module.course_id)
    .single()

  // Buscar contagem de módulos já concluídos pelo aluno em todo o curso
  const { data: userCompletedList } = await adminClient
    .from('user_progress')
    .select('module_id')
    .eq('user_id', user.id)
    .eq('course_id', module.course_id)
    .eq('status', 'completed')

  const totalModulesCount = allModules?.length ?? 10
  const courseCompletedCount = userCompletedList?.length ?? 0

  // Próximo módulo na sequência
  const nextModule = allModules?.find((m) => m.number === module.number + 1)

  // Recuperar passo salvo no user_metadata por login
  const moduleSteps = (user.user_metadata?.module_steps as Record<string, number> | undefined) || {}
  const savedStep = moduleSteps[id]
  const initialStep = typeof savedStep === 'number' && savedStep >= 0 ? savedStep : 0

  return (
    <ModuleViewer
      module={module as Module}
      activities={activities ?? []}
      initialProgress={progress ?? null}
      initialStep={initialStep}
      courseCompletedCount={courseCompletedCount}
      totalModulesCount={totalModulesCount}
      nextModuleId={nextModule?.id ?? null}
      nextModuleTitle={nextModule ? `Módulo ${nextModule.number}: ${nextModule.title}` : null}
      courseId={course?.id ?? ''}
      userId={user.id}
    />
  )
}
