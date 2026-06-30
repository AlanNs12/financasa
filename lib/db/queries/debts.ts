import { prisma } from '@/lib/db/prisma'
import type { Debt, DebtType } from '@/types'
import {
  calculateDebtProgress,
  calculateDebtsSummary,
  calculateInstallmentPayoff,
} from '@/lib/calculations/debts'

interface RawDebt {
  id: string
  household_id: string
  institution: string
  product: string
  classification: DebtType
  down_payment: { toString: () => string } | null
  principal_amount: { toString: () => string }
  started_at: Date
  interest_rate: { toString: () => string }
  cet_rate: { toString: () => string } | null
  installment_amount: { toString: () => string }
  installment_total: number
  installment_paid: number
  is_settled: boolean
  created_at: Date
  updated_at: Date
}

function serializeDebt(d: RawDebt): Debt {
  const installmentAmount = Number(d.installment_amount)
  const calc = calculateDebtProgress({
    installment_amount: installmentAmount,
    installment_total: d.installment_total,
    installment_paid: d.installment_paid,
  })

  return {
    id: d.id,
    household_id: d.household_id,
    institution: d.institution,
    product: d.product,
    classification: d.classification,
    down_payment: d.down_payment ? Number(d.down_payment) : null,
    principal_amount: Number(d.principal_amount),
    started_at: d.started_at.toISOString(),
    interest_rate: Number(d.interest_rate),
    cet_rate: d.cet_rate ? Number(d.cet_rate) : null,
    installment_amount: installmentAmount,
    installment_total: d.installment_total,
    installment_paid: d.installment_paid,
    is_settled: d.is_settled,
    paid_amount: calc.paid_amount,
    remaining_amount: calc.remaining_amount,
    progress_pct: calc.progress_pct,
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
  }
}

export async function getDebts(householdId: string): Promise<Debt[]> {
  const debts = await prisma.debt.findMany({
    where: { household_id: householdId },
    orderBy: [{ is_settled: 'asc' }, { started_at: 'desc' }],
  })

  return debts.map((d) => serializeDebt(d as unknown as RawDebt))
}

export interface DebtsSummary {
  totalPrincipal: number
  totalPaid: number
  totalRemaining: number
}

export async function getDebtsSummary(
  householdId: string
): Promise<DebtsSummary> {
  const debts = await prisma.debt.findMany({
    where: { household_id: householdId },
  })

  return calculateDebtsSummary(
    debts.map((d) => ({
      principal_amount: Number(d.principal_amount),
      installment_amount: Number(d.installment_amount),
      installment_paid: d.installment_paid,
    }))
  )
}

export async function createDebt(data: {
  household_id: string
  institution: string
  product: string
  classification: DebtType
  down_payment?: number
  principal_amount: number
  started_at: Date
  interest_rate: number
  cet_rate?: number
  installment_amount: number
  installment_total: number
}) {
  return prisma.debt.create({ data })
}

export async function updateDebt(
  id: string,
  householdId: string,
  data: {
    institution?: string
    product?: string
    classification?: DebtType
    down_payment?: number | null
    principal_amount?: number
    started_at?: Date
    interest_rate?: number
    cet_rate?: number | null
    installment_amount?: number
    installment_total?: number
    installment_paid?: number
    is_settled?: boolean
  }
) {
  return prisma.debt.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function payInstallment(
  id: string,
  householdId: string
): Promise<{ success: boolean; settled: boolean }> {
  const debt = await prisma.debt.findFirst({
    where: { id, household_id: householdId },
    select: { installment_paid: true, installment_total: true, is_settled: true },
  })

  if (!debt) return { success: false, settled: false }

  const payoff = calculateInstallmentPayoff(
    debt.installment_paid,
    debt.installment_total,
    debt.is_settled
  )

  if (payoff.alreadySettled) return { success: true, settled: true }

  await prisma.debt.update({
    where: { id },
    data: {
      installment_paid: payoff.newPaid,
      is_settled: payoff.willSettle,
    },
  })

  return { success: true, settled: payoff.willSettle }
}

export async function deleteDebt(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.debt.deleteMany({
    where: { id, household_id: householdId },
  })
  return result.count
}
