'use client'

import { useState } from 'react'
import type { AIPracticeStep, TutorEvaluation } from '@/lib/types'

interface Props {
  step: AIPracticeStep
  activityId: string
  userId: string
  onNext: () => void
}

type Phase = 'input' | 'loading' | 'feedback' | 'done'

export default function StepAIPractice({ step, activityId, userId, onNext }: Props) {
  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [evaluation, setEvaluation] = useState<TutorEvaluation | null>(null)
  const [error, setError] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)

  async function handleSubmit() {
    if (!prompt.trim() || prompt.length < 10) {
      setError('Escreva um prompt com pelo menos 10 caracteres.')
      return
    }
    setError('')
    setPhase('loading')

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao conectar com o Tutor IA.')
      }

      const data: TutorEvaluation = await res.json()
      setEvaluation(data)
      setAttemptCount((c) => c + 1)

      // Salvar tentativa
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: activityId, // será ignorado no progresso do módulo
          course_id: 'placeholder',
          status: 'in_progress',
        }),
      }).catch(() => {}) // silenciar erros de tentativa

      if (data.can_continue) {
        setPhase('done')
      } else {
        setPhase('feedback')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avaliar prompt.')
      setPhase('input')
    }
  }

  function handleRetry() {
    setPhase('input')
    setEvaluation(null)
  }

  const criteriaItems = [
    { key: 'objective' as const, label: 'Objetivo' },
    { key: 'context' as const, label: 'Contexto' },
    { key: 'sources' as const, label: 'Tipo de fonte' },
    { key: 'output_format' as const, label: 'Formato da resposta' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{step.instructions}</p>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-2">💡 Tente incluir:</p>
          <div className="flex flex-wrap gap-2">
            {step.hints.map((hint, i) => (
              <span key={i} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                {hint}
              </span>
            ))}
          </div>
        </div>

        {/* Input */}
        {(phase === 'input' || phase === 'feedback') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu pedido para a IA:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={step.placeholder}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm resize-none"
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">O Tutor IA está avaliando seu prompt...</p>
          </div>
        )}

        {/* Feedback */}
        {evaluation && (phase === 'feedback' || phase === 'done') && (
          <div className="mt-4 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${evaluation.score >= 75 ? 'text-green-600' : evaluation.score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                {evaluation.score}%
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${evaluation.score >= 75 ? 'bg-green-500' : evaluation.score >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>
            </div>

            {/* Critérios */}
            <div className="grid grid-cols-2 gap-2">
              {criteriaItems.map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    evaluation[key] ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <span>{evaluation[key] ? '✅' : '⚠️'}</span>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Feedback do tutor */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Feedback do Tutor IA:</p>
              <p className="text-sm text-gray-600 leading-relaxed">{evaluation.feedback}</p>
            </div>

            {/* O que falta */}
            {evaluation.missing.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2">Ainda falta incluir:</p>
                <ul className="space-y-1">
                  {evaluation.missing.map((m, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                      <span>•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Prática concluída */}
        {phase === 'done' && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold">Prática concluída ✅</p>
            <p className="text-green-600 text-sm mt-1">
              Seu prompt atingiu os critérios necessários. Pode avançar!
            </p>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      {phase === 'input' && (
        <button
          onClick={handleSubmit}
          disabled={prompt.trim().length < 10}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Enviar para o Tutor IA
        </button>
      )}

      {phase === 'feedback' && (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500">
            Tente melhorar seu prompt e envie novamente.
          </p>
          <button
            onClick={handleRetry}
            className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
          {attemptCount >= 2 && (
            <button
              onClick={onNext}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Avançar mesmo assim →
            </button>
          )}
        </div>
      )}

      {phase === 'done' && (
        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
        >
          Continuar para avaliação →
        </button>
      )}
    </div>
  )
}
