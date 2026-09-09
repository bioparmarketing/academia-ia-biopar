'use client'

import type { ContentStep } from '@/lib/types'

interface Props {
  step: ContentStep
  onNext: () => void
}

export default function StepContent({ step, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h2>

        <p className="text-gray-700 text-base leading-relaxed">{step.body}</p>

        {step.highlight && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
              <p className="text-amber-800 font-medium text-sm leading-relaxed">
                {step.highlight}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
      >
        {step.cta} →
      </button>
    </div>
  )
}
