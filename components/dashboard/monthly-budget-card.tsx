'use client'

import { formatCurrency } from '@/lib/format'
import Link from 'next/link'

interface MonthlyBudgetCardProps {
  month: string
  balance: number
  spent: number
  totalBudget: number
  percentage: number
  expectedBudget?: {
    expectedIncome: number
    totalBills: number
    totalCommitted: number
    expectedAvailable: number
    hasExpectedData: boolean
  }
}

export function MonthlyBudgetCard({
  month,
  balance,
  spent,
  totalBudget,
  percentage,
  expectedBudget,
}: MonthlyBudgetCardProps) {
  const percent = Math.min(100, percentage)

  return (
    <div className="rounded-2xl p-6 text-white shadow-theme-lg relative
                    overflow-hidden
                    bg-gradient-to-br from-[#0F1115] to-[#2D2F36]
                    dark:from-[#2D2F36] dark:to-[#0F1115]
                    border border-white/5">
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full
                      bg-white/[0.04] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full
                      bg-white/[0.04] translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">
              Orçamento Mensal
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </p>
            <p className="text-white/60 text-xs mt-1">saldo disponível</p>
          </div>
          <span className="text-xs font-medium bg-white/20 rounded-full px-3 py-1">
            {month}
          </span>
        </div>

        <div className="mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-white/70">
          <span>Gasto: {formatCurrency(spent)}</span>
          <span>Meta: {formatCurrency(totalBudget)}</span>
        </div>

        <Link
          href="/planejamento"
          className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/60 hover:text-white transition-colors font-medium"
        >
          Ver detalhes &rarr;
        </Link>

        {expectedBudget?.hasExpectedData && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-3">
              Orçamento esperado
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Receita prevista</span>
                <span className="text-white/90 font-medium">
                  +{formatCurrency(expectedBudget.expectedIncome)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">(-) Contas fixas</span>
                <span className="text-white/70">
                  -{formatCurrency(expectedBudget.totalBills)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">(-) Gastos comprometidos</span>
                <span className="text-white/70">
                  -{formatCurrency(expectedBudget.totalCommitted)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-white/10">
                <span className="text-white/80 font-medium">
                  (=) Disponível esperado
                </span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      expectedBudget.expectedAvailable >= 0
                        ? '#4ade80'
                        : '#f87171',
                  }}
                >
                  {formatCurrency(expectedBudget.expectedAvailable)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
