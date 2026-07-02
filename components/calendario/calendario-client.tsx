'use client'

import { useState, useMemo } from 'react'
import {
  getDaysInMonth, getDay, format,
  startOfMonth
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Receipt, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { CalendarDayMap, CalendarEventType } from '@/lib/db/queries/calendar'
import { DayDetailPanel } from './day-detail-panel'

export const EVENT_CONFIG: Record<CalendarEventType, {
  dot: string
  bg: string
  text: string
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
}> = {
  income: {
    dot:  'bg-success-500',
    bg:   'bg-success-50 dark:bg-success-500/10',
    text: 'text-success-700 dark:text-success-400',
    icon: TrendingUp,
    label: 'Entrada',
  },
  expense: {
    dot:  'bg-error-500',
    bg:   'bg-error-50 dark:bg-error-500/10',
    text: 'text-error-700 dark:text-error-400',
    icon: TrendingDown,
    label: 'Saída',
  },
  bill_pending: {
    dot:  'bg-warning-500',
    bg:   'bg-warning-50 dark:bg-warning-500/10',
    text: 'text-warning-700 dark:text-warning-400',
    icon: Receipt,
    label: 'Conta pendente',
  },
  bill_paid: {
    dot:  'bg-success-500',
    bg:   'bg-success-50 dark:bg-success-500/10',
    text: 'text-success-700 dark:text-success-400',
    icon: Receipt,
    label: 'Conta paga',
  },
  bill_overdue: {
    dot:  'bg-error-500',
    bg:   'bg-error-50 dark:bg-error-500/10',
    text: 'text-error-700 dark:text-error-400',
    icon: Receipt,
    label: 'Conta vencida',
  },
  card_due: {
    dot:  'bg-brand-500',
    bg:   'bg-brand-50 dark:bg-brand-500/10',
    text: 'text-brand-700 dark:text-brand-400',
    icon: CreditCard,
    label: 'Vencimento fatura',
  },
  card_closing: {
    dot:  'bg-muted-foreground',
    bg:   'bg-muted',
    text: 'text-muted-foreground',
    icon: CreditCard,
    label: 'Fechamento fatura',
  },
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface CalendarioClientProps {
  dayMap: CalendarDayMap
  month: number
  year: number
}

export function CalendarioClient({ dayMap, month, year }: CalendarioClientProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const calendarData = useMemo(() => {
    const firstDay = startOfMonth(new Date(year, month - 1, 1))
    const totalDays = getDaysInMonth(firstDay)
    const startWeekday = getDay(firstDay)

    return { firstDay, totalDays, startWeekday }
  }, [month, year])

  const selectedEvents = selectedDay ? (dayMap[selectedDay] ?? []) : []
  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === month &&
                         today.getFullYear() === year

  const monthLabel = format(new Date(year, month - 1, 1), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transações, vencimentos e faturas do mês
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">

        {/* CALENDÁRIO */}
        <div className="rounded-2xl border border-border bg-card shadow-theme-xs overflow-hidden">

          <div className="px-5 py-4 border-b border-border">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {([
                { type: 'income',       label: 'Entrada' },
                { type: 'expense',      label: 'Saída' },
                { type: 'bill_pending', label: 'Conta pendente' },
                { type: 'bill_paid',    label: 'Conta paga' },
                { type: 'card_due',     label: 'Vencimento fatura' },
                { type: 'card_closing', label: 'Fechamento' },
              ] as const).map(({ type, label }) => (
                <div key={type}
                     className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    EVENT_CONFIG[type].dot
                  )} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map(day => (
              <div key={day}
                   className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: calendarData.startWeekday }).map((_, i) => (
              <div key={`empty-${i}`}
                   className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border bg-muted/20" />
            ))}

            {Array.from({ length: calendarData.totalDays }, (_, i) => i + 1).map(day => {
              const events = dayMap[day] ?? []
              const isSelected = selectedDay === day
              const isTodayDay = isCurrentMonth && today.getDate() === day

              const uniqueTypes = [...new Set(events.map(e => e.type))].slice(0, 4)

              const col = (calendarData.startWeekday + day - 1) % 7
              const isLastCol = col === 6

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  aria-label={`${day} de ${monthLabel} — ${events.length} evento${events.length !== 1 ? 's' : ''}`}
                  className={cn(
                    'min-h-[80px] sm:min-h-[100px] p-2 border-b border-border',
                    'text-left transition-colors relative',
                    !isLastCol && 'border-r',
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-500/10'
                      : events.length > 0
                      ? 'hover:bg-muted/50 cursor-pointer'
                      : 'hover:bg-muted/30 cursor-pointer'
                  )}
                >
                  <span className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full',
                    'text-sm font-medium mb-1.5 transition-colors',
                    isTodayDay
                      ? 'bg-brand-500 text-white font-bold'
                      : isSelected
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                      : 'text-foreground'
                  )}>
                    {day}
                  </span>

                  {uniqueTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {uniqueTypes.map(type => (
                        <span
                          key={type}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            EVENT_CONFIG[type].dot
                          )}
                        />
                      ))}
                      {events.length > 4 && (
                        <span className="text-[9px] text-muted-foreground leading-none self-end">
                          +{events.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {events.length > 0 && (
                    <div className="hidden sm:block mt-1">
                      {(() => {
                        const income = events
                          .filter(e => e.type === 'income')
                          .reduce((s, e) => s + (e.amount ?? 0), 0)
                        const expense = events
                          .filter(e => e.type === 'expense')
                          .reduce((s, e) => s + (e.amount ?? 0), 0)
                        return (
                          <div className="space-y-0.5">
                            {income > 0 && (
                              <p className="text-[10px] text-success-600 dark:text-success-400 font-medium tabular-nums leading-none">
                                +{formatCurrency(income)}
                              </p>
                            )}
                            {expense > 0 && (
                              <p className="text-[10px] text-error-600 dark:text-error-400 font-medium tabular-nums leading-none">
                                -{formatCurrency(expense)}
                              </p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </button>
              )
            })}

            {(() => {
              const total = calendarData.startWeekday + calendarData.totalDays
              const remainder = total % 7
              const fill = remainder === 0 ? 0 : 7 - remainder
              return Array.from({ length: fill }).map((_, i) => (
                <div key={`fill-${i}`}
                     className="min-h-[80px] sm:min-h-[100px] border-r border-border bg-muted/20 last:border-r-0" />
              ))
            })()}
          </div>
        </div>

        <DayDetailPanel
          day={selectedDay}
          month={month}
          year={year}
          events={selectedEvents}
          onClose={() => setSelectedDay(null)}
        />
      </div>

      {selectedDay !== null && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-[40] bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          />
          <div className="fixed bottom-0 inset-x-0 z-[50] bg-card rounded-t-3xl border-t border-border max-h-[75vh] overflow-y-auto">
            <div className="p-4">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <DayDetailPanel
                day={selectedDay}
                month={month}
                year={year}
                events={selectedEvents}
                onClose={() => setSelectedDay(null)}
                isMobile
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
