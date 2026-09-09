'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Module, Activity, UserProgress, ModuleContent, ModuleStep } from '@/lib/types'
import StepContent from './StepContent'
import StepLimitations from './StepLimitations'
import StepAIPractice from './StepAIPractice'
import StepQuiz from './StepQuiz'
import StepCompletion from './StepCompletion'

interface Props {
  module: Module
  activities: Activity[]
  initialProgress: UserProgress | null
  courseId: string
  userId: string
}

export default function ModuleViewer({ module, activities, initialProgress, courseId, userId }: Props) {
  const router = useRouter()
  const content = module.content as ModuleContent | null
  const steps = content?.steps ?? []
  const totalSteps = steps.length

  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(initialProgress?.status === 'completed')
  const [finalScore, setFinalScore] = useState<number | null>(initialProgress?.score ?? null)

  const saveProgress = useCallback(async (status: 'in_progress' | 'completed', score?: number) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: module.id, course_id: courseId, status, score }),
      })
    } catch (err) {
      console.error('Erro ao salvar progresso:', err)
    }
  }, [module.id, courseId])

  const handleNext = useCallback(async () => {
    if (currentStep < totalSteps - 1) {
      // Marcar como in_progress na primeira avançada
      if (currentStep === 0 && initialProgress?.status !== 'in_progress') {
        await saveProgress('in_progress')
      }
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, totalSteps, initialProgress, saveProgress])

  const handleComplete = useCallback(async (score: number) => {
    setFinalScore(score)
    setIsCompleted(true)
    await saveProgress('completed', score)
  }, [saveProgress])

  // Tela de conclusão
  if (isCompleted && currentStep >= totalSteps - 1) {
    return (
      <StepCompletion
        moduleName={module.title}
        moduleNumber={module.number}
        score={finalScore}
        onBack={() => {
          router.push('/')
          router.refresh()
        }}
      />
    )
  }

  const step = steps[currentStep] as ModuleStep | undefined
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-500">
        Módulo sem conteúdo. Entre em contato com o administrador.
      </div>
    )
  }

  // Encontrar activity_id correspondente ao passo atual (pelo sequence)
  const activity = activities[currentStep]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb + progresso */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Academia
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Módulo {module.number}</p>
            <h1 className="text-xl font-bold text-gray-900">{module.title}</h1>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Barra de progresso do módulo */}
        <div className="flex gap-1.5 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentStep
                  ? 'bg-green-500'
                  : i === currentStep
                  ? 'bg-green-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Renderizar step correto */}
      {step.type === 'content' && (
        <StepContent step={step} onNext={handleNext} />
      )}
      {step.type === 'limitations' && (
        <StepLimitations step={step} onNext={handleNext} />
      )}
      {step.type === 'ai_practice' && (
        <StepAIPractice
          step={step}
          activityId={activity?.id ?? ''}
          userId={userId}
          onNext={handleNext}
        />
      )}
      {step.type === 'quiz' && (
        <StepQuiz
          step={step}
          activityId={activity?.id ?? ''}
          userId={userId}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
