import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentLayout from '@/components/layout/StudentLayout'

export default async function StudentAreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Permite que tanto student quanto admin acessem o curso
  return <StudentLayout profile={profile}>{children}</StudentLayout>
}
