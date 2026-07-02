'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MonthSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const now = new Date()
  const month = Number(searchParams.get('month')) || now.getMonth() + 1
  const year = Number(searchParams.get('year')) || now.getFullYear()

  const date = new Date(year, month - 1, 1)
  const monthLabel = format(date, 'MMMM', { locale: ptBR }).toUpperCase()

  function navigate(newMonth: number, newYear: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', String(newMonth))
    params.set('year', String(newYear))
    router.push(`${pathname}?${params.toString()}`)
  }

  function nextMonth() {
    if (month === 12) navigate(1, year + 1)
    else navigate(month + 1, year)
  }

  function prevMonth() {
    if (month === 1) navigate(12, year - 1)
    else navigate(month - 1, year)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prevMonth}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold text-foreground min-w-[90px] text-center">
        {monthLabel} {year}
      </span>
      <button
        onClick={nextMonth}
        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
