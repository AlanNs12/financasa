'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import {
  accountBelongsToHousehold,
  creditCardBelongsToHousehold,
} from '@/lib/db/queries/ownership'
import {
  deleteCardInvoicePayment,
  upsertCardInvoicePayment,
} from '@/lib/db/queries/faturas'

export async function payCardInvoiceAction(
  creditCardId: string,
  month: number,
  year: number,
  accountId: string,
  amount: number
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  if (!amount || amount <= 0) {
    return { error: 'Valor inválido.' }
  }

  if (!(await creditCardBelongsToHousehold(creditCardId, current.householdId))) {
    return { error: 'Cartão inválido.' }
  }

  if (!(await accountBelongsToHousehold(accountId, current.householdId))) {
    return { error: 'Conta inválida.' }
  }

  await upsertCardInvoicePayment({
    household_id: current.householdId,
    user_id: current.userId,
    credit_card_id: creditCardId,
    account_id: accountId,
    billing_month: month,
    billing_year: year,
    amount,
  })

  revalidatePath('/faturas')
  revalidatePath('/contas-bancarias')
  revalidatePath('/')
  return { success: true }
}

export async function unpayCardInvoiceAction(
  creditCardId: string,
  month: number,
  year: number
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteCardInvoicePayment(
    creditCardId,
    month,
    year,
    current.householdId
  )

  if (count === 0) {
    return { error: 'Pagamento não encontrado.' }
  }

  revalidatePath('/faturas')
  revalidatePath('/contas-bancarias')
  revalidatePath('/')
  return { success: true }
}
