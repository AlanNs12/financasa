'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
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
