'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMonth } from '@/lib/month-context'

export function MonthSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { month, year, setMonth } = useMonth()

  const date = new Date(year, month - 1, 1)
  const monthLabel = format(date, 'MMMM', { locale: ptBR }).toUpperCase()

  function navigate(newMonth: number, newYear: number) {
    setMonth(newMonth, newYear)
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
    <div className="flex items-center gap-0.5 sm:gap-1 rounded-xl border border-border
                    bg-background px-0.5 sm:px-1 py-1 shadow-theme-xs">
      <button
        onClick={prevMonth}
        aria-label="Mês anterior"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-muted-foreground hover:bg-muted hover:text-foreground
                   transition-colors shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-center text-xs sm:text-sm font-semibold
                       text-foreground uppercase tracking-wide px-1 sm:px-2 whitespace-nowrap">
        {monthLabel} {year}
      </span>
      <button
        onClick={nextMonth}
        aria-label="Próximo mês"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-muted-foreground hover:bg-muted hover:text-foreground
                   transition-colors shrink-0"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
