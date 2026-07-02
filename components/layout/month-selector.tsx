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
    <div className="flex items-center gap-1 rounded-xl border border-border
                    bg-background px-1 py-1 shadow-theme-xs">
      <button
        onClick={prevMonth}
        aria-label="Mês anterior"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-muted-foreground hover:bg-muted hover:text-foreground
                   transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[120px] text-center text-sm font-semibold
                       text-foreground uppercase tracking-wide px-2">
        {monthLabel} {year}
      </span>
      <button
        onClick={nextMonth}
        aria-label="Próximo mês"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-muted-foreground hover:bg-muted hover:text-foreground
                   transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
