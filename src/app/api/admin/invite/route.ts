import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // 1. Validar que o usuário que está chamando a rota é admin
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
      return NextResponse.json({ error: 'Apenas administradores podem convidar usuários.' }, { status: 403 })
    }

    // 2. Extrair dados da requisição
    const body = await request.json()
    const { email, full_name, role, department } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const selectedRole = role === 'admin' ? 'admin' : 'student'

    // 3. Usar a Service Role Key para disparar o convite por e-mail no Supabase
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const origin = request.headers.get('origin')
    const siteUrl = origin && !origin.includes('localhost')
      ? origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://academia-ia-biopar-three.vercel.app')

    // inviteUserByEmail dispara o e-mail oficial do Supabase para o usuário definir sua senha
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name || '',
        role: selectedRole,
        department: department || ''
      },
      redirectTo: `${siteUrl}/set-password`
    })

    // 4. Se o usuário já existe, gerar novo link de recuperação/definição de senha
    if (inviteError) {
      if (inviteError.message.includes('already registered') || inviteError.message.includes('already been registered')) {
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo: `${siteUrl}/set-password` }
        })

        if (linkError) {
          return NextResponse.json({ error: 'Usuário já cadastrado, mas ocorreu um erro ao gerar link de redefinição.' }, { status: 400 })
        }

        // Atualizar perfil com o papel/departamento caso tenha mudado
        const { data: existingUser } = await adminSupabase.from('profiles').select('id').eq('email', email).single()
        if (existingUser?.id) {
          await adminSupabase.from('profiles').update({
            full_name: full_name || undefined,
            role: selectedRole,
            department: department || undefined
          }).eq('id', existingUser.id)
        }

        return NextResponse.json({
          success: true,
          actionUrl: linkData?.properties?.action_link,
          message: `O e-mail ${email} já possui cadastro! Um novo link para definir a senha foi gerado.`
        })
      }

      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    // 4. Garantir que o perfil foi criado ou atualizado com o papel correto
    if (inviteData?.user?.id) {
      await adminSupabase.from('profiles').upsert({
        id: inviteData.user.id,
        email,
        full_name: full_name || '',
        role: selectedRole,
        department: department || ''
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Convite enviado com sucesso para ${email}! O usuário receberá um link para cadastrar sua senha.` 
    })

  } catch (error) {
    console.error('[/api/admin/invite] Erro:', error)
    return NextResponse.json({ error: 'Erro interno ao processar convite.' }, { status: 500 })
  }
}
