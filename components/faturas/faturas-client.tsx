'use client'

import { useState } from 'react'
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FaturaData } from '@/lib/db/queries/faturas'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function FaturasClient({
  data,
  month,
  year,
}: {
  data: FaturaData
  month: number
  year: number
}) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Faturas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gastos em cartão de crédito · {MONTH_NAMES[month - 1]} {year}
        </p>
      </div>

      <div
        className="rounded-2xl p-6 text-white shadow-theme-lg
                    bg-gradient-to-br from-[#0F1115] to-[#2D2F36]
                    border border-white/5 relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full
                      bg-white/[0.04] -translate-y-1/2 translate-x-1/2"
        />
        <p className="text-white/60 text-sm font-medium mb-1">
          Total das faturas · {MONTH_NAMES[month - 1]}
        </p>
        <p className="text-4xl font-bold tracking-tight">
          {formatCurrency(data.totalGeral)}
        </p>
        <p className="text-white/50 text-xs mt-2">
          {data.cards.length} cartão(ões) ·{' '}
          {data.cards.reduce((s, c) => s + c.transactions.length, 0) +
            data.transactionsSemCartao.length}{' '}
          transações
        </p>
      </div>

      {data.totalGeral === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CreditCard
            size={32}
            className="mx-auto text-muted-foreground mb-3"
          />
          <p className="text-sm font-medium text-foreground">
            Nenhuma fatura este mês
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Não há gastos em cartão de crédito em {MONTH_NAMES[month - 1]}{' '}
            {year}
          </p>
        </div>
      )}

      {data.cards.map((card) => (
        <div
          key={card.cardId}
          className="rounded-2xl border border-border bg-card shadow-theme-xs overflow-hidden"
        >
          <button
            onClick={() => toggle(card.cardId)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {card.cardName}
                {card.issuer && (
                  <span className="font-normal text-muted-foreground ml-1">
                    · {card.issuer}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                {card.closingDay && (
                  <span className="text-[11px] text-muted-foreground">
                    Fecha dia {card.closingDay}
                  </span>
                )}
                {card.dueDay && (
                  <span className="text-[11px] text-muted-foreground">
                    Vence dia {card.dueDay}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {card.transactions.length} compras
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-base font-bold text-[#EF4444]">
                {formatCurrency(card.total)}
              </p>
              {expandedCards.has(card.cardId) ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </div>
          </button>

          {expandedCards.has(card.cardId) && (
            <div className="border-t border-border">
              {card.transactions.map((t, i) => (
                <div
                  key={t.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i < card.transactions.length - 1 &&
                      'border-b border-border/60'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${t.categoryColor}20` }}
                  >
                    {t.categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t.categoryName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ·
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(
                          new Date(t.date + 'T12:00:00'),
                          'dd/MM',
                          { locale: ptBR }
                        )}
                      </span>
                      {t.billingMoved && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full
                                       bg-[#fef9c3] dark:bg-[#f59e0b]/10
                                       text-[#d97706] dark:text-[#fbbf24] font-medium"
                        >
                          fatura
                        </span>
                      )}
                      {t.installment_total && t.installment_total > 1 && (
                        <span className="text-[10px] text-primary font-medium shrink-0">
                          {t.installment_current}/{t.installment_total}x
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#EF4444] shrink-0 tabular-nums">
                    -{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total {card.cardName}
                </span>
                <span className="text-sm font-bold text-[#EF4444]">
                  {formatCurrency(card.total)}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {data.transactionsSemCartao.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-theme-xs overflow-hidden">
          <button
            onClick={() => toggle('sem-cartao')}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Crédito sem cartão vinculado
              </p>
              <p className="text-[11px] text-muted-foreground">
                {data.transactionsSemCartao.length} transações
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-base font-bold text-[#EF4444]">
                {formatCurrency(data.totalSemCartao)}
              </p>
              {expandedCards.has('sem-cartao') ? (
                <ChevronUp size={16} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground" />
              )}
            </div>
          </button>
          {expandedCards.has('sem-cartao') && (
            <div className="border-t border-border">
              {data.transactionsSemCartao.map((t, i) => (
                <div
                  key={t.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    i < data.transactionsSemCartao.length - 1 &&
                      'border-b border-border/60'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${t.categoryColor}20` }}
                  >
                    {t.categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {t.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.categoryName} ·{' '}
                      {format(new Date(t.date + 'T12:00:00'), 'dd/MM', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#EF4444] tabular-nums">
                    -{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
