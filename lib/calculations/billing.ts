export interface BillingPeriod {
  billingMonth: number
  billingYear: number
}

export interface InstallmentBillingPlan {
  installmentNumber: number
  billingMonth: number
  billingYear: number
  amount: number
}

export function calculateBillingPeriod(
  purchaseDate: Date,
  closingDay: number | null | undefined
): BillingPeriod {
  const day = purchaseDate.getDate()
  const month = purchaseDate.getMonth() + 1
  const year = purchaseDate.getFullYear()

  if (!closingDay || day <= closingDay) {
    return { billingMonth: month, billingYear: year }
  }

  if (month === 12) {
    return { billingMonth: 1, billingYear: year + 1 }
  }

  return { billingMonth: month + 1, billingYear: year }
}

export function getBillingLabel(period: BillingPeriod): string {
  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${MONTHS[period.billingMonth - 1]} ${period.billingYear}`
}

export function previewBillingPeriod(
  dateString: string,
  closingDay: number | null | undefined
): BillingPeriod | null {
  if (!dateString) return null
  const date = new Date(dateString + 'T12:00:00')
  if (isNaN(date.getTime())) return null
  return calculateBillingPeriod(date, closingDay)
}

export function calculateInstallmentPlan(
  purchaseDate: Date,
  closingDay: number | null | undefined,
  totalAmount: number,
  installments: number
): InstallmentBillingPlan[] {
  const perInstallment = Math.round((totalAmount / installments) * 100) / 100
  const firstBilling = calculateBillingPeriod(purchaseDate, closingDay)

  return Array.from({ length: installments }, (_, i) => {
    let m = firstBilling.billingMonth + i
    let y = firstBilling.billingYear

    while (m > 12) {
      m -= 12
      y += 1
    }

    const isLast = i === installments - 1
    const amount = isLast
      ? Math.round((totalAmount - perInstallment * (installments - 1)) * 100) / 100
      : perInstallment

    return {
      installmentNumber: i + 1,
      billingMonth: m,
      billingYear: y,
      amount,
    }
  })
}
