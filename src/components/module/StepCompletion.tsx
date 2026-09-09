'use client'

interface Props {
  moduleName: string
  moduleNumber: number
  score: number | null
  completedCount: number
  totalModules: number
  nextModuleId?: string | null
  nextModuleTitle?: string | null
  onBack: () => void
  onNextModule?: () => void
}

export default function StepCompletion({
  moduleName,
  moduleNumber,
  score,
  completedCount,
  totalModules,
  nextModuleId,
  nextModuleTitle,
  onBack,
  onNextModule,
}: Props) {
  const safeTotal = totalModules > 0 ? totalModules : 10
  const safeCompleted = Math.min(safeTotal, Math.max(1, completedCount))
  const progressPercent = Math.round((safeCompleted / safeTotal) * 100)
  const isCourseCompleted = safeCompleted >= safeTotal

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* Ícone de conclusão */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <span className="text-4xl">{isCourseCompleted ? '🏆' : '🎉'}</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {isCourseCompleted ? 'Curso Finalizado' : 'Módulo Concluído'}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            Módulo {moduleNumber} concluído!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{moduleName}</p>
        </div>

        {score !== null && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Pontuação na Avaliação</p>
            <p className="text-3xl font-bold text-green-700">{score}%</p>
          </div>
        )}

        {/* Progresso do curso atualizado */}
        <div className="bg-gray-50 rounded-xl p-5 text-left border border-gray-100">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Seu Progresso no Treinamento
            </span>
            <span className="text-base font-bold text-green-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {safeCompleted} de {safeTotal} módulos concluídos
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 pt-2">
          {nextModuleId && onNextModule && !isCourseCompleted && (
            <button
              onClick={onNextModule}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <span>Continuar para o Próximo Módulo</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}

          <button
            onClick={onBack}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-colors cursor-pointer text-sm ${
              nextModuleId && !isCourseCompleted
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Voltar para o Painel da Academia
          </button>
        </div>
      </div>
    </div>
  )
}
