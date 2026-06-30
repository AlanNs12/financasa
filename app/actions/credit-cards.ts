'use server'

import { revalidatePath } from 'next/cache'
import {
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
} from '@/lib/db/queries/credit-cards'
import { creditCardSchema } from '@/lib/validations/credit-card'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'

export async function createCreditCardAction(data: {
  name: string
  issuer?: string
  spending_cap?: number
  closing_day?: number
  due_day?: number
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = creditCardSchema.safeParse({
    name: data.name,
    issuer: data.issuer,
    spending_cap: data.spending_cap != null ? String(data.spending_cap) : undefined,
    closing_day: data.closing_day,
    due_day: data.due_day,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createCreditCard({
    household_id: current.householdId,
    name: parsed.data.name,
    issuer: parsed.data.issuer,
    spending_cap: parsed.data.spending_cap,
    closing_day: parsed.data.closing_day,
    due_day: parsed.data.due_day,
  })

  revalidatePath('/configuracoes')
  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}

export async function updateCreditCardAction(
  id: string,
  data: {
    name?: string
    issuer?: string | null
    spending_cap?: number | null
    closing_day?: number | null
    due_day?: number | null
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = creditCardSchema.safeParse({
    name: data.name ?? '',
    issuer: data.issuer ?? undefined,
    spending_cap: data.spending_cap != null ? String(data.spending_cap) : undefined,
    closing_day: data.closing_day ?? undefined,
    due_day: data.due_day ?? undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateCreditCard(id, current.householdId, {
    name: parsed.data.name,
    issuer: parsed.data.issuer ?? null,
    spending_cap: parsed.data.spending_cap ?? null,
    closing_day: parsed.data.closing_day ?? null,
    due_day: parsed.data.due_day ?? null,
  })

  revalidatePath('/configuracoes')
  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCreditCardAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteCreditCard(id, current.householdId)

  if (count === 0) {
    return { error: 'Cartão não encontrado.' }
  }

  revalidatePath('/configuracoes')
  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}
