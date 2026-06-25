'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonthStore } from '@/store/month-store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MONTHS = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
]

export function MonthSelector() {
  const { month, year, nextMonth, prevMonth } = useMonthStore()
  const date = new Date(year, month - 1, 1)
  const monthLabel = format(date, 'MMMM', { locale: ptBR }).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prevMonth}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold text-gray-900 min-w-[90px] text-center">
        {monthLabel} {year}
      </span>
      <button
        onClick={nextMonth}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
