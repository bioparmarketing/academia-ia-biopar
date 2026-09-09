'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile | null
  children: React.ReactNode
}

export default function StudentLayout({ profile, children }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm hidden sm:block">
              Academia de IA BioPar
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Painel Admin
              </Link>
            )}
            <span className="text-sm text-gray-600 hidden sm:block">
              {profile?.full_name || profile?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  )
}
