import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // 1. Validar que o usuário autenticado é admin
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem criar usuários.' }, { status: 403 })
    }

    // 2. Extrair dados
    const body = await request.json()
    const { email, full_name, role, department, password } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
    }

    const selectedRole = role === 'admin' ? 'admin' : 'student'

    // 3. Usar a Service Role Key para criar o usuário diretamente e confirmá-lo imediatamente
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Tentar criar diretamente com createUser
    const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Já cria confirmado, sem depender de envio de e-mail
      user_metadata: {
        full_name: full_name || '',
        role: selectedRole,
        department: department || ''
      }
    })

    if (createError) {
      // Se o usuário já existir, atualizar a senha e o perfil
      if (
        createError.message.includes('already registered') || 
        createError.message.includes('already been registered')
      ) {
        // Buscar o usuário pelo e-mail
        const { data: userList } = await adminSupabase.auth.admin.listUsers()
        const existingAuthUser = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (existingAuthUser?.id) {
          await adminSupabase.auth.admin.updateUserById(existingAuthUser.id, {
            password,
            user_metadata: {
              full_name: full_name || '',
              role: selectedRole,
              department: department || ''
            }
          })

          await adminSupabase.from('profiles').upsert({
            id: existingAuthUser.id,
            email,
            full_name: full_name || '',
            role: selectedRole,
            department: department || ''
          })

          return NextResponse.json({
            success: true,
            message: `Usuário ${email} já existia. A senha e os dados foram atualizados com sucesso!`
          })
        }
      }

      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // 4. Garantir criação do perfil na tabela profiles
    if (userData?.user?.id) {
      await adminSupabase.from('profiles').upsert({
        id: userData.user.id,
        email,
        full_name: full_name || '',
        role: selectedRole,
        department: department || ''
      })
    }

    return NextResponse.json({
      success: true,
      message: `Conta criada com sucesso para ${email}! O usuário já pode acessar imediatamente com a senha cadastrada.`
    })

  } catch (error) {
    console.error('[/api/admin/invite] Erro:', error)
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 })
  }
}
