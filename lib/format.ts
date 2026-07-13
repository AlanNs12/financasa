export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(date))
}

export function formatDateFull(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function getMonthName(month: number): string {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return names[month - 1] || ''
}

export function getMonthAbbr(month: number): string {
  const names = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
  ]
  return names[month - 1] || ''
}

export function getDefaultTransactionDate(
  selectedMonth: number,
  selectedYear: number
): string {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (selectedYear === currentYear && selectedMonth === currentMonth) {
    return now.toISOString().split('T')[0]
  }

  if (
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth > currentMonth)
  ) {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  }

  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
  return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`
}
