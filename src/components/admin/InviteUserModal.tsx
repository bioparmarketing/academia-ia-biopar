'use client'

import { useState } from 'react'

export default function InviteUserModal({ onUserInvited }: { onUserInvited?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState<'student' | 'admin'>('student')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
          department
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar convite.')
      }

      setMessage({ type: 'success', text: data.message })
      setEmail('')
      setFullName('')
      setDepartment('')
      setRole('student')
      if (onUserInvited) onUserInvited()

      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
      }, 3000)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar convite.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Convidar Novo Colaborador
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Novo Colaborador</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Será disparado um e-mail com link exclusivo para que a pessoa cadastre sua própria senha e acesse a plataforma.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="colaborador@biopar.agr.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Departamento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: P&D, Comercial, Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Papel na Plataforma
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🎓 Aluno (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🛡️ Administrador
                  </button>
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Disparando...' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
