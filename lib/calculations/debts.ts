export interface DebtCalculationInput {
  installment_amount: number
  installment_total: number
  installment_paid: number
}

export interface DebtCalculationResult {
  paid_amount: number
  remaining_amount: number
  progress_pct: number
}

export function calculateDebtProgress(
  input: DebtCalculationInput
): DebtCalculationResult {
  const paidAmount = input.installment_amount * input.installment_paid
  const remainingAmount =
    input.installment_amount * input.installment_total - paidAmount
  const progressPct =
    input.installment_total > 0
      ? (input.installment_paid / input.installment_total) * 100
      : 0

  return {
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
    progress_pct: progressPct,
  }
}

export interface DebtsSummaryCalculationInput {
  principal_amount: number
  installment_amount: number
  installment_paid: number
}

export interface DebtsSummaryCalculationResult {
  totalPrincipal: number
  totalPaid: number
  totalRemaining: number
}

export function calculateDebtsSummary(
  debts: DebtsSummaryCalculationInput[]
): DebtsSummaryCalculationResult {
  let totalPrincipal = 0
  let totalPaid = 0

  for (const d of debts) {
    totalPrincipal += d.principal_amount
    totalPaid += d.installment_amount * d.installment_paid
  }

  return {
    totalPrincipal,
    totalPaid,
    totalRemaining: totalPrincipal - totalPaid,
  }
}

export function calculateInstallmentPayoff(
  installmentPaid: number,
  installmentTotal: number,
  isSettled: boolean
): { newPaid: number; willSettle: boolean; alreadySettled: boolean } {
  if (isSettled) {
    return { newPaid: installmentPaid, willSettle: true, alreadySettled: true }
  }

  const newPaid = installmentPaid + 1
  const willSettle = newPaid >= installmentTotal

  return { newPaid, willSettle, alreadySettled: false }
}
