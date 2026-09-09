import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InviteUserModal from '@/components/admin/InviteUserModal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RecentPromptRow {
  id: string
  user_id: string
  answer: string | null
  score: number | null
  feedback: string | null
  attempt_number: number
  created_at: string
  profiles: {
    full_name: string | null
    email: string
    department: string | null
  } | null
  activities: {
    title: string
    activity_type: string
    modules: { number: number; title: string } | null
  } | null
}

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

  // Buscar todos os prompts dos alunos
  const { data: rawRecentPrompts } = await adminClient
    .from('activity_attempts')
    .select('*, profiles(full_name, email, department), activities(title, activity_type, modules(number, title))')
    .order('created_at', { ascending: false })
    .limit(50)

  const recentPrompts = (rawRecentPrompts as unknown as RecentPromptRow[])?.filter(
    (p) => p.answer && p.answer !== 'step_progress' && p.answer !== 'quiz_completed'
  ) || []

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

    const studentPromptsCount = recentPrompts.filter((p) => p.user_id === student.id).length

    return { ...student, completed, avgScore, currentModule, studentPromptsCount }
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logobiopar.webp"
                alt="BioPar"
                width={112}
                height={40}
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block text-gray-300 font-light">|</span>
            <span className="font-semibold text-gray-800 text-sm hidden sm:block">Academia de IA</span>
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium ml-1">
              Painel Admin
            </span>
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

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo & Relatórios</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acompanhe em tempo real o progresso, as avaliações e todos os prompts criados pelos colaboradores.
          </p>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard title="Total de Alunos" value={totalStudents} icon="👥" />
          <MetricCard title="Alunos Ativos" value={activeStudents} icon="✅" />
          <MetricCard title="Progresso Médio" value={`${avgProgress}%`} icon="📊" />
          <MetricCard title="Módulos Concluídos" value={completedModules} icon="🎓" />
          <MetricCard title="Prompts Criados" value={recentPrompts.length} icon="💬" />
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
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Relatório</th>
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
                          Ver prompts & detalhes →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Relatório Geral de Prompts Criados pelos Alunos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <span>💬</span>
                <span>Relatório Geral de Prompts dos Alunos</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Acompanhe o conteúdo exato que os alunos estão enviando para a IA nas práticas e os feedbacks recebidos
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {recentPrompts.length} {recentPrompts.length === 1 ? 'prompt registrado' : 'prompts registrados'}
            </span>
          </div>

          {recentPrompts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📝</p>
              <p className="font-medium text-gray-600 text-sm">Nenhum prompt registrado ainda.</p>
              <p className="text-xs text-gray-400 mt-1">
                Conforme os alunos forem executando as práticas com o Tutor IA, os prompts criados aparecerão aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPrompts.map((promptItem) => (
                <div key={promptItem.id} className="p-6 hover:bg-gray-50/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href={`/admin/users/${promptItem.user_id}`}
                        className="font-semibold text-sm text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {promptItem.profiles?.full_name || promptItem.profiles?.email || 'Aluno'}
                      </Link>
                      {promptItem.profiles?.department && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {promptItem.profiles.department}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                        {promptItem.activities?.modules ? `Módulo ${promptItem.activities.modules.number}` : 'Módulo'}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {promptItem.activities?.title || 'Prática com IA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {promptItem.score !== null && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          promptItem.score >= 75
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : promptItem.score >= 50
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          Nota: {promptItem.score}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(promptItem.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Caixa do Prompt do Aluno */}
                  <div className="bg-gray-900 text-gray-100 rounded-xl p-4 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Prompt criado pelo aluno:
                    </span>
                    <p className="text-sm font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {promptItem.answer}
                    </p>
                  </div>

                  {/* Feedback do Tutor IA */}
                  {promptItem.feedback && (
                    <div className="mt-3 bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900">
                      <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                        <span>🤖</span> Feedback do Tutor IA:
                      </p>
                      <p className="leading-relaxed text-blue-900/90 whitespace-pre-wrap">{promptItem.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
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
