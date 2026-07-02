'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createUserAndHousehold, joinHouseholdByInviteCode } from '@/lib/db/queries/user'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const inviteCode = (formData.get('invite_code') as string) || null

  const headersList = await headers()
  const origin = headersList.get('origin') ?? headersList.get('host') ?? ''
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${baseUrl}/login?confirmed=true`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  const supabaseId = data.user?.id
  if (!supabaseId) {
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  if (inviteCode) {
    const result = await joinHouseholdByInviteCode(
      supabaseId,
      name,
      email,
      inviteCode.trim().toUpperCase()
    )
    if (!result) {
      return { error: 'Código de convite inválido.' }
    }
  } else {
    await createUserAndHousehold(supabaseId, name, email)
  }

  if (!data.session) {
    return { error: 'Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPasswordAction(email: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/cadastro/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  if (newPassword.length < 6) {
    return { error: 'A nova senha deve ter pelo menos 6 caracteres' }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}
