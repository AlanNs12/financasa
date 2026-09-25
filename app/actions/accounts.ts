'use server'

import { revalidatePath } from 'next/cache'
import {
  createAccount,
  updateAccount,
  deleteAccount,
  createTransfer,
  deleteTransfer,
} from '@/lib/db/queries/accounts'
import { accountSchema, transferSchema } from '@/lib/validations/account'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { prisma } from '@/lib/db/prisma'
import type { AccountType } from '@prisma/client'

function revalidateAccounts() {
  revalidatePath('/contas-bancarias')
  revalidatePath('/transacoes')
  revalidatePath('/')
}

export async function createAccountAction(data: {
  name: string
  type?: string
  institution?: string
  initial_balance?: number
  color?: string
  icon?: string
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = accountSchema.safeParse({
    name: data.name,
    type: data.type,
    institution: data.institution,
    initial_balance: data.initial_balance,
    color: data.color,
    icon: data.icon,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createAccount({
    household_id: current.householdId,
    name: parsed.data.name,
    type: parsed.data.type as AccountType,
    institution: parsed.data.institution,
    initial_balance: parsed.data.initial_balance,
    color: parsed.data.color,
    icon: parsed.data.icon,
  })

  revalidateAccounts()
  return { success: true }
}

export async function updateAccountAction(
  id: string,
  data: {
    name?: string
    type?: string
    institution?: string | null
    initial_balance?: number
    color?: string | null
    icon?: string | null
    is_active?: boolean
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = accountSchema.safeParse({
    name: data.name ?? '',
    type: data.type,
    institution: data.institution ?? undefined,
    initial_balance: data.initial_balance,
    color: data.color ?? undefined,
    icon: data.icon ?? undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateAccount(id, current.householdId, {
    name: parsed.data.name,
    type: parsed.data.type as AccountType,
    institution: data.institution ?? null,
    initial_balance: parsed.data.initial_balance,
    color: data.color ?? null,
    icon: data.icon ?? null,
    is_active: data.is_active,
  })

  revalidateAccounts()
  return { success: true }
}

export async function deleteAccountAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteAccount(id, current.householdId)

  if (count === 0) {
    return { error: 'Conta não encontrada.' }
  }

  revalidateAccounts()
  return { success: true }
}

export async function createTransferAction(data: {
  from_account_id: string
  to_account_id: string
  amount: number
  date: string
  description?: string
  notes?: string
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = transferSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const accounts = await prisma.account.findMany({
    where: {
      household_id: current.householdId,
      is_active: true,
      id: { in: [parsed.data.from_account_id, parsed.data.to_account_id] },
    },
    select: { id: true },
  })

  if (accounts.length !== 2) {
    return { error: { _form: 'Conta inválida.' } }
  }

  await createTransfer({
    household_id: current.householdId,
    user_id: current.userId,
    from_account_id: parsed.data.from_account_id,
    to_account_id: parsed.data.to_account_id,
    amount: parsed.data.amount,
    date: new Date(parsed.data.date + 'T12:00:00'),
    description: parsed.data.description,
    notes: parsed.data.notes,
  })

  revalidateAccounts()
  return { success: true }
}

export async function deleteTransferAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteTransfer(id, current.householdId)

  if (count === 0) {
    return { error: 'Transferência não encontrada.' }
  }

  revalidateAccounts()
  return { success: true }
}
