export type ComputedBillStatus = 'PAID' | 'PENDING' | 'OVERDUE'

export function computeBillStatus(
  dueDay: number,
  month: number,
  year: number,
  savedStatus?: string | null,
  today: Date = new Date()
): ComputedBillStatus {
  if (savedStatus === 'PAID') return 'PAID'
  if (savedStatus === 'SKIPPED') return 'PENDING'

  const currentDay = today.getDate()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  if (year < currentYear) return 'OVERDUE'
  if (year === currentYear && month < currentMonth) return 'OVERDUE'

  const dim = new Date(year, month, 0).getDate()
  const effectiveDueDay = dueDay > dim ? dim : dueDay

  if (year === currentYear && month === currentMonth && effectiveDueDay < currentDay) {
    return 'OVERDUE'
  }

  return 'PENDING'
}

export function billAppliesInMonth(
  startMonth: number,
  startYear: number,
  recurrence: string,
  month: number,
  year: number
): boolean {
  const monthDiff = (year - startYear) * 12 + (month - startMonth)
  if (monthDiff < 0) return false

  switch (recurrence) {
    case 'MONTHLY':
      return true
    case 'BIMONTHLY':
      return monthDiff % 2 === 0
    case 'QUARTERLY':
      return monthDiff % 3 === 0
    case 'SEMIANNUAL':
      return monthDiff % 6 === 0
    case 'ANNUAL':
      return monthDiff % 12 === 0
    default:
      return true
  }
}
