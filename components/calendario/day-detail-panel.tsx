'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type { CalendarEvent } from '@/lib/db/queries/calendar'
import { EVENT_CONFIG } from './calendario-client'

interface DayDetailPanelProps {
  day: number | null
  month: number
  year: number
  events: CalendarEvent[]
  onClose: () => void
  isMobile?: boolean
}

export function DayDetailPanel({ day, month, year, events, onClose, isMobile }: DayDetailPanelProps) {
  if (day === null) {
    return (
      <div className="hidden lg:flex rounded-2xl border border-border bg-card shadow-theme-xs h-48 items-center justify-center text-center p-6">
        <div>
          <Calendar size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Clique em um dia para ver os eventos
          </p>
        </div>
      </div>
    )
  }

  const dateLabel = format(
    new Date(year, month - 1, day),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )

  const grouped = {
    income:  events.filter(e => e.type === 'income'),
    expense: events.filter(e => e.type === 'expense'),
    bills:   events.filter(e => e.type.startsWith('bill_')),
    cards:   events.filter(e => e.type.startsWith('card_')),
  }

  const totalIncome  = grouped.income.reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalExpense = grouped.expense.reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div className={cn(
      !isMobile && 'rounded-2xl border border-border bg-card shadow-theme-xs',
      'overflow-hidden'
    )}>

      <div className="flex items-start justify-between p-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {format(new Date(year, month - 1, day), 'EEEE', { locale: ptBR })}
          </p>
          <h3 className="text-base font-bold text-foreground capitalize">
            {dateLabel}
          </h3>
        </div>
        {!isMobile && (
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {(totalIncome > 0 || totalExpense > 0) && (
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-border">
          {totalIncome > 0 && (
            <div className="rounded-xl bg-success-50 dark:bg-success-500/10 p-3">
              <p className="text-xs text-success-600 dark:text-success-400 font-medium mb-0.5">
                Entradas
              </p>
              <p className="text-base font-bold text-success-700 dark:text-success-300 tabular-nums">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          )}
          {totalExpense > 0 && (
            <div className="rounded-xl bg-error-50 dark:bg-error-500/10 p-3">
              <p className="text-xs text-error-600 dark:text-error-400 font-medium mb-0.5">
                Saídas
              </p>
              <p className="text-base font-bold text-error-700 dark:text-error-300 tabular-nums">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        {grouped.income.length > 0 && (
          <EventGroup title="Entradas" events={grouped.income} showAmount />
        )}

        {grouped.expense.length > 0 && (
          <EventGroup title="Saídas" events={grouped.expense} showAmount />
        )}

        {grouped.bills.length > 0 && (
          <EventGroup title="Contas" events={grouped.bills} showAmount />
        )}

        {grouped.cards.length > 0 && (
          <EventGroup title="Cartões de crédito" events={grouped.cards} showAmount={false} />
        )}

        {events.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum evento neste dia
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface EventGroupProps {
  title: string
  events: CalendarEvent[]
  showAmount: boolean
}

function EventGroup({ title, events, showAmount }: EventGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="space-y-2">
        {events.map(event => {
          const cfg = EVENT_CONFIG[event.type]
          const Icon = cfg.icon
          return (
            <div
              key={event.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                cfg.bg
              )}
            >
              {event.categoryIcon ? (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{
                    backgroundColor: event.categoryColor
                      ? `${event.categoryColor}20`
                      : undefined
                  }}
                >
                  {event.categoryIcon}
                </div>
              ) : (
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  cfg.bg
                )}>
                  <Icon size={15} className={cfg.text} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {event.label}
                </p>
                <div className="flex items-center gap-1.5">
                  {event.sublabel && (
                    <p className="text-xs text-muted-foreground truncate">
                      {event.sublabel}
                    </p>
                  )}
                  {event.billingMoved && (
                    <span className="text-[10px] text-[#d97706] dark:text-[#fbbf24]
                                     bg-[#fef9c3] dark:bg-[#f59e0b]/10
                                     px-1.5 py-0.5 rounded-full font-medium shrink-0
                                     whitespace-nowrap">
                      fatura
                    </span>
                  )}
                </div>
              </div>

              {showAmount && event.amount !== undefined && event.amount > 0 && (
                <p className={cn(
                  'text-sm font-semibold tabular-nums shrink-0',
                  cfg.text
                )}>
                  {event.type === 'income' ? '+' : '-'}
                  {formatCurrency(event.amount)}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
