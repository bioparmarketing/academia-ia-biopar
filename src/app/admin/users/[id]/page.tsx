import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface ProgressRow {
  id: string
  status: string
  score: number | null
  modules: { number: number; title: string } | null
}

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

  // Buscar dados do aluno
  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) redirect('/admin')

  // Buscar progresso do aluno
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*, modules(number, title)')
    .eq('user_id', id)
    .order('modules(number)')

  // Buscar tentativas
  const { data: attempts } = await supabase
    .from('activity_attempts')
    .select('*, activities(title, activity_type)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const completedCount = progress?.filter((p) => p.status === 'completed').length ?? 0
  const scores = progress?.filter((p) => p.score !== null).map((p) => p.score as number) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

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
                <p className="text-xs text-gray-400 mt-1">📍 {student.department}</p>
              )}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}/10</p>
                <p className="text-xs text-gray-400">Módulos</p>
              </div>
              {avgScore !== null && (
                <div>
                  <p className={`text-2xl font-bold ${avgScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {avgScore}%
                  </p>
                  <p className="text-xs text-gray-400">Média</p>
                </div>
              )}
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progresso do curso</span>
              <span>{completedCount * 10}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${completedCount * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progresso por módulo */}
        {progress && progress.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Módulos</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(progress as unknown as ProgressRow[]).map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    {p.modules && <p className="text-sm font-medium text-gray-800">Módulo {p.modules.number}: {p.modules.title}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {p.score != null && (
                      <span className="text-sm font-medium text-gray-600">{p.score}%</span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      p.status === 'completed' ? 'bg-green-100 text-green-700' :
                      p.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'completed' ? 'Concluído' : p.status === 'in_progress' ? 'Em andamento' : 'Não iniciado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Últimas tentativas */}
        {attempts && attempts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Últimas atividades</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {(attempts as unknown as AttemptRow[]).map((attempt) => (
                <div key={attempt.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{attempt.activities?.title ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(attempt.created_at).toLocaleDateString('pt-BR')}
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
