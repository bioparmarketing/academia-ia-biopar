import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AttemptRow {
  id: string
  score: number | null
  feedback: string | null
  created_at: string
  activities: { title: string; activity_type: string } | null
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (adminProfile?.role !== 'admin') redirect('/')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Buscar dados do aluno
  const { data: student } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) redirect('/admin')

  // Buscar todos os módulos do curso
  const { data: allModules } = await adminClient
    .from('modules')
    .select('id, number, title')
    .order('number')

  // Buscar progresso do aluno
  const { data: progress } = await adminClient
    .from('user_progress')
    .select('*, modules(number, title)')
    .eq('user_id', id)

  const progressMap = new Map<string, { status: string; score: number | null }>()
  progress?.forEach((p) => {
    progressMap.set(p.module_id, { status: p.status, score: p.score })
  })

  // Buscar tentativas
  const { data: attempts } = await adminClient
    .from('activity_attempts')
    .select('*, activities(title, activity_type)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalModules = allModules?.length ?? 10
  const completedCount = progress?.filter((p) => p.status === 'completed').length ?? 0
  const scores = progress?.filter((p) => p.score !== null).map((p) => p.score as number) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Painel Admin
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium">{student.full_name || student.email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Card do aluno */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.full_name || '—'}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{student.email}</p>
              {student.department && (
                <p className="text-xs text-gray-500 mt-1 font-medium">📍 {student.department}</p>
              )}
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}/{totalModules}</p>
                <p className="text-xs text-gray-400 font-medium">Módulos Concluídos</p>
              </div>
              {avgScore !== null ? (
                <div>
                  <p className={`text-2xl font-bold ${avgScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {avgScore}%
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Média das Avaliações</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-400">—</p>
                  <p className="text-xs text-gray-400 font-medium">Média</p>
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 font-medium mb-1.5">
              <span>Progresso geral do curso</span>
              <span className="text-green-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progresso por módulo (Todos os 10 módulos) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Status dos Módulos</h2>
            <span className="text-xs text-gray-400">{completedCount} de {totalModules} concluídos</span>
          </div>
          <div className="divide-y divide-gray-100">
            {allModules?.map((mod, index) => {
              const userProg = progressMap.get(mod.id)
              const isCompleted = userProg?.status === 'completed'
              const isInProgress = userProg?.status === 'in_progress'
              const isUnlocked = index === 0 || (allModules && progressMap.get(allModules[index - 1].id)?.status === 'completed')

              return (
                <div key={mod.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isInProgress
                        ? 'bg-yellow-100 text-yellow-700'
                        : isUnlocked
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : mod.number}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Módulo {mod.number}: {mod.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {userProg?.score != null && (
                      <span className="text-sm font-bold text-gray-700">{userProg.score}%</span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isCompleted ? 'bg-green-100 text-green-700' :
                      isInProgress ? 'bg-yellow-100 text-yellow-700' :
                      isUnlocked ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? 'Concluído' : isInProgress ? 'Em andamento' : isUnlocked ? 'Liberado' : 'Bloqueado'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Últimas atividades */}
        {attempts && attempts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Últimas atividades realizadas</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(attempts as unknown as AttemptRow[]).map((attempt) => (
                <div key={attempt.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{attempt.activities?.title ?? 'Atividade'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(attempt.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {attempt.score != null && (
                      <span className={`text-sm font-bold ${attempt.score >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {attempt.score}%
                      </span>
                    )}
                  </div>
                  {attempt.feedback && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{attempt.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
