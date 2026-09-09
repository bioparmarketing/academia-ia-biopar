import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Module, UserProgress } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Usar admin client para evitar que restrições de RLS bloqueiem a leitura do progresso do aluno
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Buscar perfil
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Buscar curso ativo
  const { data: courses, error: courseError } = await adminClient
    .from('courses')
    .select('*')
    .eq('active', true)

  const course = courses?.find(c => c.slug === 'ia-aplicada-pdi') || courses?.[0]

  if (!course) {
    console.error('Course query error:', courseError, 'Courses returned:', courses)
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum curso disponível no momento.
      </div>
    )
  }

  // Buscar módulos
  const { data: modules } = await adminClient
    .from('modules')
    .select('*')
    .eq('course_id', course.id)
    .eq('active', true)
    .order('number')

  // Buscar progresso do usuário logado usando adminClient garantido
  const { data: progressList } = await adminClient
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)

  const progressMap = new Map<string, UserProgress>()
  progressList?.forEach((p) => progressMap.set(p.module_id, p))

  const totalModules = modules?.length ?? 0
  const completedCount = progressList?.filter((p) => p.status === 'completed').length ?? 0
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  // Encontrar próximo módulo desbloqueado que ainda não foi concluído
  const nextModule = modules?.find((m, idx) => {
    const isCompleted = progressMap.get(m.id)?.status === 'completed'
    if (isCompleted) return false
    // Primeiro módulo sempre disponível
    if (idx === 0) return true
    // Módulos seguintes dependem do anterior estar concluído
    const prevModule = modules[idx - 1]
    return progressMap.get(prevModule.id)?.status === 'completed'
  })

  // Se todos foram concluídos, próximo módulo é null
  const isAllCompleted = progressPercent === 100 || (totalModules > 0 && completedCount === totalModules)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 text-sm mb-1">Bem-vindo de volta,</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
        </h1>
      </div>

      {/* Card do curso */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              {isAllCompleted ? 'Curso concluído' : 'Curso em andamento'}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{course.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{course.description}</p>
          </div>
          {nextModule && !isAllCompleted && (
            <Link
              href={`/modules/${nextModule.id}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Continuar treinamento</span>
            </Link>
          )}
          {isAllCompleted && (
            <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl font-semibold text-sm">
              <span className="text-lg">🎉</span> Parabéns! Curso concluído com sucesso!
            </div>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso do curso</span>
            <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {completedCount} de {totalModules} módulos concluídos
            </p>
            {nextModule && !isAllCompleted && (
              <p className="text-xs text-green-600 font-medium">
                Próximo: Módulo {nextModule.number}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lista de módulos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Módulos do curso</h3>
          <span className="text-xs text-gray-400">Total: {totalModules} módulos</span>
        </div>
        <div className="space-y-3">
          {modules?.map((module: Module, index: number) => {
            const progress = progressMap.get(module.id)
            const isCompleted = progress?.status === 'completed'
            const isInProgress = progress?.status === 'in_progress'

            // Verificar se módulo está liberado: primeiro módulo OU módulo anterior concluído
            const isAvailable =
              index === 0 ||
              progressMap.get(modules[index - 1].id)?.status === 'completed'

            const isLocked = !isAvailable && !isCompleted

            return (
              <ModuleCard
                key={module.id}
                module={module}
                progress={progress}
                isCompleted={isCompleted}
                isInProgress={isInProgress}
                isLocked={isLocked}
                isAvailable={isAvailable}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  module,
  progress,
  isCompleted,
  isInProgress,
  isLocked,
  isAvailable,
}: {
  module: Module
  progress?: UserProgress
  isCompleted: boolean
  isInProgress: boolean
  isLocked: boolean
  isAvailable: boolean
}) {
  const content = (
    <div
      className={`flex items-center gap-4 bg-white border rounded-xl p-4 transition-all ${
        isLocked
          ? 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed'
          : isCompleted
          ? 'border-green-200 hover:border-green-300 hover:shadow-sm cursor-pointer bg-white'
          : isInProgress
          ? 'border-yellow-200 hover:border-yellow-300 hover:shadow-sm cursor-pointer bg-white'
          : 'border-gray-200 hover:border-green-300 hover:shadow-sm cursor-pointer bg-white'
      }`}
    >
      {/* Ícone de status */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isCompleted
            ? 'bg-green-100 text-green-700'
            : isInProgress
            ? 'bg-yellow-100 text-yellow-700'
            : isLocked
            ? 'bg-gray-100 text-gray-400'
            : 'bg-green-50 text-green-600 border border-green-200'
        }`}
      >
        {isCompleted ? '✅' : isLocked ? '🔒' : isInProgress ? '▶' : module.number}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500">Módulo {module.number}</span>
          {isCompleted && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Concluído {progress?.score != null ? `• ${progress.score}%` : ''}
            </span>
          )}
          {isInProgress && !isCompleted && (
            <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
              Em andamento
            </span>
          )}
          {!isLocked && !isCompleted && !isInProgress && isAvailable && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Liberado
            </span>
          )}
          {isLocked && (
            <span className="text-xs text-gray-400">
              Bloqueado (conclua o módulo {module.number - 1})
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-800 text-sm mt-0.5">{module.title}</p>
        {module.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{module.description}</p>
        )}
      </div>

      {/* Duração + seta */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-gray-400 hidden sm:block">
          {module.estimated_minutes} min
        </span>
        {!isLocked && (
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )

  if (isLocked) return <div>{content}</div>

  return (
    <Link href={`/modules/${module.id}`}>
      {content}
    </Link>
  )
}
