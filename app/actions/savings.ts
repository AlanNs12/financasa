'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { accountBelongsToHousehold } from '@/lib/db/queries/ownership'
import {
  createJar,
  updateJar,
  deactivateJar,
  createJarMovement,
  getJarWithBalance,
} from '@/lib/db/queries/savings'
import { getAccountsWithBalances } from '@/lib/db/queries/accounts'
import { savingsJarSchema, jarMovementSchema } from '@/lib/validations/savings-jar'
import { formatCurrency } from '@/lib/format'

function revalidateSavings() {
  revalidatePath('/contas-bancarias')
  revalidatePath('/')
}

export async function createJarAction(data: {
  name: string
  account_id: string
  target_amount?: number
  color?: string
  icon?: string
  initial_amount?: number
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = savingsJarSchema.safeParse({
    name: data.name,
    account_id: data.account_id,
    target_amount: data.target_amount,
    color: data.color,
    icon: data.icon,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  if (!(await accountBelongsToHousehold(parsed.data.account_id, current.householdId))) {
    return { error: { account_id: ['Conta inválida.'] } }
  }

  const initialAmount = data.initial_amount ?? 0

  if (initialAmount > 0) {
    const accounts = await getAccountsWithBalances(current.householdId)
    const account = accounts.find((a) => a.id === parsed.data.account_id)
    if (!account || initialAmount > account.available) {
      return {
        error: {
          initial_amount: [
            `Valor acima do disponível (${formatCurrency(account?.available ?? 0)}).`,
          ],
        },
      }
    }
  }

  const jar = await createJar({
    household_id: current.householdId,
    account_id: parsed.data.account_id,
    user_id: current.userId,
    name: parsed.data.name,
    target_amount: parsed.data.target_amount,
    color: parsed.data.color,
    icon: parsed.data.icon,
  })

  if (initialAmount > 0) {
    await createJarMovement({
      jar_id: jar.id,
      user_id: current.userId,
      type: 'DEPOSIT',
      amount: initialAmount,
    })
  }

  revalidateSavings()
  return { success: true }
}

export async function updateJarAction(
  id: string,
  data: {
    name?: string
    target_amount?: number | null
    color?: string | null
    icon?: string | null
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  if (!data.name || data.name.trim().length === 0) {
    return { error: { name: ['Nome obrigatório'] } }
  }

  if (data.target_amount != null && data.target_amount < 0) {
    return { error: { target_amount: ['Meta não pode ser negativa'] } }
  }

  const result = await updateJar(id, current.householdId, {
    name: data.name.trim(),
    target_amount: data.target_amount ?? null,
    color: data.color ?? null,
    icon: data.icon ?? null,
  })

  if (result.count === 0) {
    return { error: { _form: 'Cofrinho não encontrado.' } }
  }

  revalidateSavings()
  return { success: true }
}

export async function deleteJarAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const jar = await getJarWithBalance(id, current.householdId)
  if (!jar) {
    return { error: 'Cofrinho não encontrado.' }
  }

  if (jar.balance > 0) {
    return { error: 'Resgate todo o valor antes de excluir o cofrinho.' }
  }

  await deactivateJar(id, current.householdId)

  revalidateSavings()
  return { success: true }
}

export async function depositToJarAction(
  jarId: string,
  amount: number,
  note?: string,
  date?: string
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const parsed = jarMovementSchema.safeParse({
    jar_id: jarId,
    type: 'DEPOSIT',
    amount: String(amount),
    note,
    date,
  })
  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  const jar = await getJarWithBalance(jarId, current.householdId)
  if (!jar) {
    return { error: 'Cofrinho não encontrado.' }
  }

  const accounts = await getAccountsWithBalances(current.householdId)
  const account = accounts.find((a) => a.id === jar.account_id)
  const available = account?.available ?? 0

  if (parsed.data.amount > available) {
    return { error: `Disponível insuficiente (${formatCurrency(available)}).` }
  }

  await createJarMovement({
    jar_id: jarId,
    user_id: current.userId,
    type: 'DEPOSIT',
    amount: parsed.data.amount,
    date: parsed.data.date ? new Date(parsed.data.date + 'T12:00:00') : undefined,
    note: parsed.data.note,
  })

  revalidateSavings()
  return { success: true }
}

export async function withdrawFromJarAction(
  jarId: string,
  amount: number,
  note?: string,
  date?: string
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const parsed = jarMovementSchema.safeParse({
    jar_id: jarId,
    type: 'WITHDRAW',
    amount: String(amount),
    note,
    date,
  })
  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  const jar = await getJarWithBalance(jarId, current.householdId)
  if (!jar) {
    return { error: 'Cofrinho não encontrado.' }
  }

  if (parsed.data.amount > jar.balance) {
    return { error: `Você só tem ${formatCurrency(jar.balance)} guardado.` }
  }

  await createJarMovement({
    jar_id: jarId,
    user_id: current.userId,
    type: 'WITHDRAW',
    amount: parsed.data.amount,
    date: parsed.data.date ? new Date(parsed.data.date + 'T12:00:00') : undefined,
    note: parsed.data.note,
  })

  revalidateSavings()
  return { success: true }
}
