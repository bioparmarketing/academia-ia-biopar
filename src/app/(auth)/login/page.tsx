'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Importar dinamicamente para evitar erros de prerender sem env vars
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('E-mail ou senha inválidos. Verifique seus dados e tente novamente.')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      {/* Vídeo de Fundo: looping, mudo, sem player/controles */}
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="fixed inset-0 w-full h-full object-cover pointer-events-none -z-30"
      >
        <source src="/videofundo.mp4" type="video/mp4" />
      </video>

      {/* Camada 1: Overlay com opacidade suave e gradiente escuro/esmeralda */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gradient-to-b from-black/65 via-emerald-950/45 to-black/80 backdrop-blur-[1px] -z-20 pointer-events-none"
      />

      {/* Camada 2: Textura suave pontilhada de alta definição */}
      <div
        aria-hidden="true"
        className="fixed inset-0 opacity-20 pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Camada 3: Vinheta radial suave para focar o conteúdo central */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(2, 6, 23, 0.5) 75%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />

      {/* Conteúdo Central */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center">
        {/* Logo / Header com destaque iluminado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-6 py-3.5 bg-white/95 backdrop-blur-md rounded-2xl mb-4 shadow-xl shadow-emerald-950/40 ring-1 ring-white/60">
            <Image
              src="/logobiopar.webp"
              alt="BioPar"
              width={160}
              height={57}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
            Academia de IA BioPar
          </h1>
          <p className="text-emerald-100 mt-1.5 text-xs sm:text-sm font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Aprenda IA usando a própria IA.
          </p>
        </div>

        {/* Card de login com efeito Glassmorphism elegante */}
        <div className="w-full bg-white/92 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/60 p-6 sm:p-9 transition-all">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 sm:mb-6">
            Entrar na plataforma
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200/90 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm text-gray-900 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200/90 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm text-gray-900 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            {error && (
              <div className="bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-60 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl shadow-lg shadow-green-600/25 transition-all text-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] mt-5 sm:mt-6 leading-relaxed">
          Acesso restrito a colaboradores BioPar.<br />
          <span className="text-white/75">Para cadastro, entre em contato com o administrador.</span>
        </p>
      </div>
    </div>
  )
}
