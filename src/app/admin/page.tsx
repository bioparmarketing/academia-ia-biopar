import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InviteUserModal from '@/components/admin/InviteUserModal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // Usar admin client para buscar métricas e todos os colaboradores com segurança
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: allProfiles } = await adminClient
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  const { data: allProgress } = await adminClient
    .from('user_progress')
    .select('*')

  const { data: allModules } = await adminClient
    .from('modules')
    .select('id, number, title')
    .order('number')

  const studentIds = new Set(allProfiles?.map((s) => s.id) ?? [])
  const studentProgress = allProgress?.filter((p) => studentIds.has(p.user_id)) ?? []

  const totalStudents = allProfiles?.length ?? 0
  const completedModules = studentProgress.filter((p) => p.status === 'completed').length
  const activeStudents = new Set(studentProgress.map((p) => p.user_id)).size

  // Calcular progresso médio da turma
  const totalPossible = totalStudents * 10
  const avgProgress = totalPossible > 0 ? Math.round((completedModules / totalPossible) * 100) : 0

  // Enriquecer perfis com progresso detalhado
  const studentsWithProgress = allProfiles?.map((student) => {
    const studentRecords = allProgress?.filter((p) => p.user_id === student.id) ?? []
    const completedRecords = studentRecords.filter((p) => p.status === 'completed')
    const completed = completedRecords.length

    const scores = completedRecords
      .filter((p) => p.score !== null && p.score !== undefined)
      .map((p) => p.score as number)

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

    const inProgressRecord = studentRecords.find((p) => p.status === 'in_progress')

    let currentModule = 'Não iniciado'
    if (inProgressRecord) {
      const inProgMod = allModules?.find((m) => m.id === inProgressRecord.module_id)
      currentModule = inProgMod ? `Módulo ${inProgMod.number} (Em andamento)` : 'Em andamento'
    } else if (completed === 10) {
      currentModule = '✅ Concluído (10/10)'
    } else if (completed > 0) {
      const completedIds = new Set(completedRecords.map((c) => c.module_id))
      const nextMod = allModules?.find((m) => !completedIds.has(m.id))
      currentModule = nextMod ? `Módulo ${nextMod.number} (Aguardando)` : `${completed} concluídos`
    }

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
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1 font-medium">Painel Admin</span>
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
          <p className="text-gray-500 text-sm mt-1">Acompanhe em tempo real o progresso e os resultados de cada colaborador.</p>
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
          <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-800 text-base">Colaboradores</h2>
              <p className="text-xs text-gray-400 mt-0.5">Acompanhamento individualizado do treinamento</p>
            </div>
            <InviteUserModal />
          </div>

          {studentsWithProgress.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">👤</p>
              <p className="font-medium text-gray-600">Nenhum aluno cadastrado ainda.</p>
              <p className="text-sm mt-1">Cadastre colaboradores usando o botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Departamento</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progresso</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Situação Atual</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Média</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsWithProgress.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{student.full_name || '—'}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">{student.department || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (student.completed / 10) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{student.completed}/10</span>
                          <span className="text-xs text-gray-400">({Math.round((student.completed / 10) * 100)}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-xs font-medium">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${
                          student.completed === 10
                            ? 'bg-green-100 text-green-700'
                            : student.currentModule.includes('Em andamento')
                            ? 'bg-yellow-100 text-yellow-700'
                            : student.completed > 0
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {student.currentModule}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {student.avgScore !== null ? (
                          <span className={`font-bold text-xs px-2 py-0.5 rounded-md ${
                            student.avgScore >= 75
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            {student.avgScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${student.id}`}
                          className="text-xs text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1 hover:underline"
                        >
                          Ver detalhes →
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
      <p className="text-xs text-gray-500 mt-1 font-medium">{title}</p>
    </div>
  )
}

function LogoutButton() {
  return (
    <Link
      href="/login"
      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
    >
      Sair
    </Link>
  )
}
