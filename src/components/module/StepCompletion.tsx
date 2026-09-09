'use client'

interface Props {
  moduleName: string
  moduleNumber: number
  score: number | null
  onBack: () => void
}

export default function StepCompletion({ moduleName, moduleNumber, score, onBack }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 space-y-6">
        {/* Ícone de conclusão */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">🎉</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo {moduleNumber} concluído!</h1>
          <p className="text-gray-500 mt-2 text-sm">{moduleName}</p>
        </div>

        {score !== null && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Pontuação obtida</p>
            <p className="text-3xl font-bold text-green-700">{score}%</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            Progresso do curso
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">10%</p>
          <p className="text-xs text-gray-400 mt-1">1 de 10 módulos concluídos</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }} />
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Voltar para Academia
        </button>
      </div>
    </div>
  )
}
