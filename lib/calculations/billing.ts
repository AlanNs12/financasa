export interface BillingPeriod {
  billingMonth: number
  billingYear: number
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
