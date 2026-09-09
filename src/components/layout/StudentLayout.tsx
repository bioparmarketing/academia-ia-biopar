'use client'

import Link from 'next/link'
import Image from 'next/image'
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
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logobiopar.webp"
              alt="BioPar"
              width={112}
              height={40}
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
            <span className="hidden sm:inline-block text-gray-300 font-light">|</span>
            <span className="font-semibold text-gray-800 text-sm hidden sm:block">
              Academia de IA
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
