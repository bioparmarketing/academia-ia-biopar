'use client'

import { useState } from 'react'
import type { QuizStep } from '@/lib/types'

interface Props {
  step: QuizStep
  activityId: string
  userId: string
  onComplete: (score: number) => void
}

type Phase = 'question' | 'correct' | 'wrong'

export default function StepQuiz({ step, activityId, userId, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('question')
  const [attempts, setAttempts] = useState(0)

  function handleAnswer(optionId: string) {
    if (phase !== 'question') return
    setSelected(optionId)
    setAttempts((a) => a + 1)

    if (optionId === step.correct) {
      setPhase('correct')
    } else {
      setPhase('wrong')
    }
  }

  function handleRetry() {
    setSelected(null)
    setPhase('question')
  }

  function handleComplete() {
    // Score: 100 se acertou na primeira tentativa, 75 se precisou de mais
    const score = attempts <= 1 ? 100 : 75
    onComplete(score)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Avaliação
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">{step.question}</h2>

        {/* Opções */}
        <div className="space-y-3">
          {step.options.map((option) => {
            const isSelected = selected === option.id
            const isCorrect = option.id === step.correct
            const showResult = phase !== 'question'

            let optionStyle = 'border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer'
            if (showResult && isCorrect) {
              optionStyle = 'border-green-400 bg-green-50'
            } else if (showResult && isSelected && !isCorrect) {
              optionStyle = 'border-red-300 bg-red-50'
            } else if (phase === 'question') {
              optionStyle = 'border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer'
            } else {
              optionStyle = 'border-gray-200 opacity-50'
            }

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={phase !== 'question'}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${optionStyle}`}
              >
                <span className={`font-bold text-sm flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  showResult && isCorrect
                    ? 'bg-green-500 text-white'
                    : showResult && isSelected && !isCorrect
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.id}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{option.text}</span>
              </button>
            )
          })}
        </div>

        {/* Resultado correto */}
        {phase === 'correct' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-semibold mb-1">✅ Correto!</p>
            <p className="text-green-700 text-sm leading-relaxed">{step.explanation}</p>
          </div>
        )}

        {/* Resultado errado */}
        {phase === 'wrong' && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-red-700 font-semibold mb-1">❌ Não exatamente.</p>
            <p className="text-red-600 text-sm">Revise as alternativas e tente novamente.</p>
          </div>
        )}
      </div>

      {/* Botões */}
      {phase === 'correct' && (
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Concluir módulo ✅
        </button>
      )}

      {phase === 'wrong' && (
        <button
          onClick={handleRetry}
          className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
