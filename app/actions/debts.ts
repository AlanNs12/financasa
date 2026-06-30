'use server'

import { revalidatePath } from 'next/cache'
import {
  createDebt,
  updateDebt,
  payInstallment,
  deleteDebt,
} from '@/lib/db/queries/debts'
import { debtSchema } from '@/lib/validations/debt'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import type { DebtType } from '@/types'

export async function createDebtAction(data: {
  institution: string
  product: string
  classification: string
  down_payment?: number
  principal_amount: number
  started_at: string
  interest_rate: number
  cet_rate?: number
  installment_amount: number
  installment_total: number
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = debtSchema.safeParse({
    institution: data.institution,
    product: data.product,
    classification: data.classification,
    down_payment: data.down_payment ?? undefined,
    principal_amount: String(data.principal_amount),
    started_at: data.started_at,
    interest_rate: String(data.interest_rate),
    cet_rate: data.cet_rate ? String(data.cet_rate) : undefined,
    installment_amount: String(data.installment_amount),
    installment_total: String(data.installment_total),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createDebt({
    household_id: current.householdId,
    institution: parsed.data.institution,
    product: parsed.data.product,
    classification: parsed.data.classification as DebtType,
    down_payment: parsed.data.down_payment,
    principal_amount: parsed.data.principal_amount,
    started_at: new Date(parsed.data.started_at + 'T12:00:00'),
    interest_rate: parsed.data.interest_rate,
    cet_rate: parsed.data.cet_rate,
    installment_amount: parsed.data.installment_amount,
    installment_total: parsed.data.installment_total,
  })

  revalidatePath('/dividas')
  return { success: true }
}

export async function updateDebtAction(
  id: string,
  data: {
    institution?: string
    product?: string
    classification?: string
    down_payment?: number | null
    principal_amount?: number
    started_at?: string
    interest_rate?: number
    cet_rate?: number | null
    installment_amount?: number
    installment_total?: number
    installment_paid?: number
    is_settled?: boolean
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = debtSchema.safeParse({
    institution: data.institution ?? '',
    product: data.product ?? '',
    classification: data.classification ?? 'OUTROS',
    down_payment: data.down_payment ?? undefined,
    principal_amount: String(data.principal_amount ?? 0),
    started_at: data.started_at ?? new Date().toISOString().split('T')[0],
    interest_rate: String(data.interest_rate ?? 0),
    cet_rate: data.cet_rate != null ? String(data.cet_rate) : undefined,
    installment_amount: String(data.installment_amount ?? 0),
    installment_total: String(data.installment_total ?? 1),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateDebt(id, current.householdId, {
    institution: parsed.data.institution,
    product: parsed.data.product,
    classification: parsed.data.classification as DebtType,
    down_payment: parsed.data.down_payment ?? null,
    principal_amount: parsed.data.principal_amount,
    started_at: new Date(parsed.data.started_at + 'T12:00:00'),
    interest_rate: parsed.data.interest_rate,
    cet_rate: parsed.data.cet_rate ?? null,
    installment_amount: parsed.data.installment_amount,
    installment_total: parsed.data.installment_total,
    installment_paid: data.installment_paid,
    is_settled: data.is_settled,
  })

  revalidatePath('/dividas')
  return { success: true }
}

export async function payInstallmentAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const result = await payInstallment(id, current.householdId)

  if (!result.success) {
    return { error: 'Dívida não encontrada.' }
  }

  revalidatePath('/dividas')
  return { success: true, settled: result.settled }
}

export async function deleteDebtAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteDebt(id, current.householdId)

  if (count === 0) {
    return { error: 'Dívida não encontrada.' }
  }

  revalidatePath('/dividas')
  return { success: true }
}
