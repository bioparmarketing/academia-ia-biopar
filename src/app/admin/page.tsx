import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Buscar métricas usando service role via API ou join
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  const { data: allProgress } = await supabase
    .from('user_progress')
    .select('*')

  const totalStudents = allProfiles?.length ?? 0
  const completedModules = allProgress?.filter((p) => p.status === 'completed').length ?? 0
  const activeStudents = new Set(allProgress?.map((p) => p.user_id)).size

  // Calcular progresso médio
  const progressByUser = new Map<string, number>()
  allProgress?.forEach((p) => {
    if (p.status === 'completed') {
      progressByUser.set(p.user_id, (progressByUser.get(p.user_id) ?? 0) + 1)
    }
  })

  const avgProgress = totalStudents > 0
    ? Math.round(
        Array.from(progressByUser.values()).reduce((a, b) => a + b, 0) /
          totalStudents * 10
      )
    : 0

  // Enriquecer perfis com progresso
  const studentsWithProgress = allProfiles?.map((student) => {
    const completed = allProgress?.filter(
      (p) => p.user_id === student.id && p.status === 'completed'
    ).length ?? 0
    const scores = allProgress
      ?.filter((p) => p.user_id === student.id && p.score !== null)
      .map((p) => p.score as number) ?? []
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null
    const inProgress = allProgress?.filter((p) => p.user_id === student.id && p.status === 'in_progress') ?? []
    const currentModule = inProgress.length > 0 ? 'Em andamento' : completed > 0 ? `${completed} concluídos` : 'Não iniciado'

    return { ...student, completed, avgScore, currentModule }
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Academia de IA BioPar</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver como Aluno
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500 text-sm mt-1">Acompanhe o progresso dos colaboradores.</p>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Total de Alunos" value={totalStudents} icon="👥" />
          <MetricCard title="Alunos Ativos" value={activeStudents} icon="✅" />
          <MetricCard title="Progresso Médio" value={`${avgProgress}%`} icon="📊" />
          <MetricCard title="Módulos Concluídos" value={completedModules} icon="🎓" />
        </div>

        {/* Tabela de alunos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Colaboradores</h2>
          </div>

          {studentsWithProgress.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">👤</p>
              <p>Nenhum aluno cadastrado ainda.</p>
              <p className="text-sm mt-1">Crie usuários no painel do Supabase.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Departamento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progresso</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Módulo Atual</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Média</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsWithProgress.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{student.full_name || '—'}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{student.department || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${(student.completed / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{student.completed}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{student.currentModule}</td>
                      <td className="px-6 py-4">
                        {student.avgScore !== null ? (
                          <span className={`font-semibold ${student.avgScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {student.avgScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${student.id}`}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Ver detalhe →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  )
}

// Client component para logout
function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <Link
        href="/login"
        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Sair
      </Link>
    </form>
  )
}
