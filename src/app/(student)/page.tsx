import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Module, UserProgress } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Buscar perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Buscar curso ativo
  const { data: courses, error: courseError } = await supabase
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
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', course.id)
    .eq('active', true)
    .order('number')

  // Buscar progresso do usuário
  const { data: progressList } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)

  const progressMap = new Map<string, UserProgress>()
  progressList?.forEach((p) => progressMap.set(p.module_id, p))

  const totalModules = modules?.length ?? 0
  const completedCount = progressList?.filter((p) => p.status === 'completed').length ?? 0
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  // Encontrar próximo módulo disponível
  const nextModuleIndex = modules?.findIndex((m, idx) => {
    if (idx === 0) return progressMap.get(m.id)?.status !== 'completed'
    const prev = modules[idx - 1]
    const prevCompleted = progressMap.get(prev.id)?.status === 'completed'
    return prevCompleted && progressMap.get(m.id)?.status !== 'completed'
  }) ?? 0

  const nextModule = modules?.[nextModuleIndex === -1 ? 0 : nextModuleIndex]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 text-sm mb-1">Bem-vindo de volta,</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.full_name || user.email?.split('@')[0]}
        </h1>
      </div>

      {/* Card do curso */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              Curso em andamento
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{course.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{course.description}</p>
          </div>
          {nextModule && progressPercent < 100 && (
            <Link
              href={`/modules/${nextModule.id}`}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continuar treinamento
            </Link>
          )}
          {progressPercent === 100 && (
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm">
              <span>🎉</span> Curso concluído!
            </div>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progresso do curso</span>
            <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {completedCount} de {totalModules} módulos concluídos
          </p>
        </div>
      </div>

      {/* Lista de módulos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Módulos do curso</h3>
        <div className="space-y-3">
          {modules?.map((module: Module, index: number) => {
            const progress = progressMap.get(module.id)
            const isCompleted = progress?.status === 'completed'
            const isInProgress = progress?.status === 'in_progress'

            // Verificar se módulo está disponível (primeiro ou anterior concluído)
            const isAvailable =
              index === 0 ||
              progressMap.get(modules[index - 1].id)?.status === 'completed'

            const isLocked = !isAvailable && !isCompleted

            return (
              <ModuleCard
                key={module.id}
                module={module}
                isCompleted={isCompleted}
                isInProgress={isInProgress}
                isLocked={isLocked}
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
  isCompleted,
  isInProgress,
  isLocked,
}: {
  module: Module
  isCompleted: boolean
  isInProgress: boolean
  isLocked: boolean
}) {
  const content = (
    <div
      className={`flex items-center gap-4 bg-white border rounded-xl p-4 transition-all ${
        isLocked
          ? 'border-gray-100 opacity-60 cursor-not-allowed'
          : isCompleted
          ? 'border-green-100 hover:border-green-200 hover:shadow-sm cursor-pointer'
          : 'border-gray-100 hover:border-green-200 hover:shadow-sm cursor-pointer'
      }`}
    >
      {/* Ícone de status */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isCompleted
            ? 'bg-green-100 text-green-600'
            : isInProgress
            ? 'bg-yellow-100 text-yellow-600'
            : isLocked
            ? 'bg-gray-100 text-gray-400'
            : 'bg-green-50 text-green-600'
        }`}
      >
        {isCompleted ? '✅' : isLocked ? '🔒' : isInProgress ? '▶' : module.number}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Módulo {module.number}</span>
          {isInProgress && (
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              Em andamento
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
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
