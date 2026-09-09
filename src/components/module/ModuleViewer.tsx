'use client'

import { useState, useCallback } from 'react'
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
  initialStep?: number
  courseCompletedCount: number
  totalModulesCount: number
  nextModuleId?: string | null
  nextModuleTitle?: string | null
  courseId: string
  userId: string
}

export default function ModuleViewer({
  module,
  activities,
  initialProgress,
  initialStep = 0,
  courseCompletedCount,
  totalModulesCount,
  nextModuleId,
  nextModuleTitle,
  courseId,
  userId,
}: Props) {
  const content = module.content as ModuleContent | null
  const steps = content?.steps ?? []
  const totalSteps = steps.length

  const [currentStep, setCurrentStep] = useState(
    initialStep >= 0 && initialStep < totalSteps ? initialStep : 0
  )
  const [isCompleted, setIsCompleted] = useState(initialProgress?.status === 'completed')
  const [finalScore, setFinalScore] = useState<number | null>(initialProgress?.score ?? null)
  const [showCompletion, setShowCompletion] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const saveProgress = useCallback(
    async (
      status: 'in_progress' | 'completed',
      score?: number,
      stepIndex?: number,
      activityId?: string
    ) => {
      try {
        const stepToSave = typeof stepIndex === 'number' ? stepIndex : currentStep
        const currentActivity = activities[stepToSave]
        const actId = activityId || currentActivity?.id

        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: module.id,
            course_id: courseId,
            status,
            score,
            step: stepToSave,
            activity_id: actId,
          }),
        })
        return res.ok
      } catch (err) {
        console.error('Erro ao salvar progresso:', err)
        return false
      }
    },
    [module.id, courseId, currentStep, activities]
  )

  const handleNext = useCallback(async () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // Salvar o passo atual no banco e no login
      await saveProgress('in_progress', undefined, nextStep)
    }
  }, [currentStep, totalSteps, saveProgress])

  const handleComplete = useCallback(
    async (score: number) => {
      setIsSaving(true)
      setFinalScore(score)
      const currentActivity = activities[currentStep]
      
      // Salva a conclusão no banco com score e último passo
      await saveProgress('completed', score, totalSteps - 1, currentActivity?.id)
      
      setIsSaving(false)
      setIsCompleted(true)
      setShowCompletion(true)
    },
    [saveProgress, activities, currentStep, totalSteps]
  )

  // Tela de conclusão após finalizar o módulo
  if (showCompletion) {
    const updatedCompletedCount = initialProgress?.status === 'completed'
      ? courseCompletedCount
      : courseCompletedCount + 1

    return (
      <StepCompletion
        moduleName={module.title}
        moduleNumber={module.number}
        score={finalScore}
        completedCount={updatedCompletedCount}
        totalModules={totalModulesCount}
        nextModuleId={nextModuleId}
        nextModuleTitle={nextModuleTitle}
        onBack={() => {
          window.location.href = '/'
        }}
        onNextModule={
          nextModuleId
            ? () => {
                window.location.href = `/modules/${nextModuleId}`
              }
            : undefined
        }
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

  const activity = activities[currentStep]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb + progresso */}
      <div className="mb-6">
        <button
          onClick={() => {
            window.location.href = '/'
          }}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mb-4 cursor-pointer font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Academia
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                Módulo {module.number}
              </span>
              {isCompleted && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                  ✅ Módulo Concluído
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{module.title}</h1>
          </div>
          <span className="text-sm font-semibold text-gray-500">
            Passo {currentStep + 1} de {totalSteps}
          </span>
        </div>

        {/* Barra de progresso interativa do módulo */}
        <div className="flex gap-1.5 mt-3">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i <= currentStep || isCompleted) {
                  setCurrentStep(i)
                }
              }}
              title={`Passo ${i + 1}`}
              disabled={i > currentStep && !isCompleted}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < currentStep
                  ? 'bg-green-500 cursor-pointer hover:bg-green-600'
                  : i === currentStep
                  ? 'bg-green-400'
                  : isCompleted
                  ? 'bg-green-200 cursor-pointer hover:bg-green-300'
                  : 'bg-gray-200 cursor-not-allowed'
              }`}
            />
          ))}
        </div>
      </div>

      {isSaving && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Salvando seu progresso...</span>
        </div>
      )}

      {/* Renderizar step correspondente */}
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
