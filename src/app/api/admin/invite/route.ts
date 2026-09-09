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

    let actionUrl: string | undefined = undefined
    let messageText = `Convite enviado com sucesso para ${email}! O usuário receberá um link para cadastrar sua senha.`

    // Tenta primeiro o envio oficial por e-mail
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name || '',
        role: selectedRole,
        department: department || ''
      },
      redirectTo: `${siteUrl}/set-password`
    })

    if (inviteError) {
      // Se estourou o limite de e-mails ou se o usuário já existe: gerar o link diretamente
      if (
        inviteError.message.includes('rate limit') || 
        inviteError.message.includes('already registered') || 
        inviteError.message.includes('already been registered')
      ) {
        let linkResult
        if (inviteError.message.includes('already registered') || inviteError.message.includes('already been registered')) {
          linkResult = await adminSupabase.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: { redirectTo: `${siteUrl}/set-password` }
          })
        } else {
          linkResult = await adminSupabase.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
              data: {
                full_name: full_name || '',
                role: selectedRole,
                department: department || ''
              },
              redirectTo: `${siteUrl}/set-password`
            }
          })
        }

        const { data: linkData, error: linkError } = linkResult

        if (!linkError && linkData?.properties?.action_link) {
          actionUrl = linkData.properties.action_link
          messageText = `Colaborador cadastrado! Como o limite de e-mails do Supabase foi atingido, copie o link de ativação abaixo para enviar ao colaborador.`

          if (linkData.user?.id) {
            await adminSupabase.from('profiles').upsert({
              id: linkData.user.id,
              email,
              full_name: full_name || '',
              role: selectedRole,
              department: department || ''
            })
          }
        } else {
          return NextResponse.json({ error: inviteError.message }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: inviteError.message }, { status: 400 })
      }
    } else if (inviteData?.user?.id) {
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
      actionUrl,
      message: messageText 
    })

  } catch (error) {
    console.error('[/api/admin/invite] Erro:', error)
    return NextResponse.json({ error: 'Erro interno ao processar convite.' }, { status: 500 })
  }
}
