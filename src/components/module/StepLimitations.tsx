'use client'

import type { LimitationsStep } from '@/lib/types'

interface Props {
  step: LimitationsStep
  onNext: () => void
}

export default function StepLimitations({ step, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{step.title}</h2>

        <div className="grid gap-3">
          {step.cards.map((card, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                card.icon === 'success'
                  ? 'bg-green-50 border-green-100'
                  : 'bg-amber-50 border-amber-100'
              }`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {card.icon === 'success' ? '✅' : '⚠️'}
              </span>
              <p
                className={`text-sm leading-relaxed font-medium ${
                  card.icon === 'success' ? 'text-green-800' : 'text-amber-800'
                }`}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
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
