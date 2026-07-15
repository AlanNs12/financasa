'use client'

import { formatCurrency } from '@/lib/format'
import Link from 'next/link'
import { useBalanceVisibility } from '@/lib/balance-visibility-context'

interface MonthlyBudgetCardProps {
  month: string
  balance: number
  spent: number
  totalBudget: number
  percentage: number
  expectedBudget?: {
    hasExpectedData: boolean
    expectedIncome: number
    actualIncome: number
    confirmedIncome: number
    pendingIncome: number
    incomeProgress: number
    totalBills: number
    paidBills: number
    pendingBills: number
    billsProgress: number
    totalExpenses: number
    variableExpenses: number
    saldoReal: number
    saldoPrevisto: number
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
  const { hideValue } = useBalanceVisibility()

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
            <p className="text-3xl font-bold tracking-tight transition-all duration-200">
              {hideValue(formatCurrency(balance))}
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
          <span>Gasto: {hideValue(formatCurrency(spent))}</span>
          <span>Meta: {hideValue(formatCurrency(totalBudget))}</span>
        </div>

        <Link
          href="/planejamento"
          className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/60 hover:text-white transition-colors font-medium"
        >
          Ver detalhes &rarr;
        </Link>

        {expectedBudget?.hasExpectedData && (
          <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
              Orçamento esperado
            </p>

            {expectedBudget.expectedIncome > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/70 font-medium">Receitas</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-white">
                      {hideValue(formatCurrency(expectedBudget.actualIncome))}
                    </span>
                    <span className="text-[11px] text-white/40">/</span>
                    <span className="text-[11px] text-white/60">
                      {hideValue(formatCurrency(expectedBudget.expectedIncome))}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${expectedBudget.incomeProgress}%`,
                      backgroundColor:
                        expectedBudget.incomeProgress >= 100
                          ? '#4ade80'
                          : expectedBudget.incomeProgress >= 50
                            ? '#fbbf24'
                            : '#f87171',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">
                    {expectedBudget.confirmedIncome > 0
                      ? `${hideValue(formatCurrency(expectedBudget.confirmedIncome))} confirmado`
                      : 'Nenhuma receita confirmada'}
                  </span>
                  {expectedBudget.pendingIncome > 0 && (
                    <span className="text-[#fbbf24]">
                      +{hideValue(formatCurrency(expectedBudget.pendingIncome))} a receber
                    </span>
                  )}
                </div>
              </div>
            )}

            {expectedBudget.totalBills > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-white/70 font-medium">Contas fixas</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-white">
                      {hideValue(formatCurrency(expectedBudget.paidBills))}
                    </span>
                    <span className="text-[11px] text-white/40">/</span>
                    <span className="text-[11px] text-white/60">
                      {hideValue(formatCurrency(expectedBudget.totalBills))}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${expectedBudget.billsProgress}%`,
                      backgroundColor:
                        expectedBudget.billsProgress >= 100 ? '#4ade80' : '#fbbf24',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">
                    {hideValue(formatCurrency(expectedBudget.paidBills))} pago
                  </span>
                  {expectedBudget.pendingBills > 0 && (
                    <span className="text-[#fbbf24]">
                      {hideValue(formatCurrency(expectedBudget.pendingBills))} pendente
                    </span>
                  )}
                </div>
              </div>
            )}

            {expectedBudget.variableExpenses > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Gastos variáveis</span>
                <span className="font-semibold text-[#f87171]">
                  -{hideValue(formatCurrency(expectedBudget.variableExpenses))}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Saldo real agora</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: expectedBudget.saldoReal >= 0 ? '#4ade80' : '#f87171' }}
                >
                  {expectedBudget.saldoReal < 0 ? '-' : ''}
                  {hideValue(formatCurrency(Math.abs(expectedBudget.saldoReal)))}
                </span>
              </div>

              {(expectedBudget.pendingIncome > 0 || expectedBudget.pendingBills > 0) && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Saldo previsto (fim do mês)</span>
                  <span
                    className="font-bold text-sm"
                    style={{
                      color: expectedBudget.saldoPrevisto >= 0 ? '#4ade80' : '#f87171',
                    }}
                  >
                    {expectedBudget.saldoPrevisto < 0 ? '-' : ''}
                    {hideValue(formatCurrency(Math.abs(expectedBudget.saldoPrevisto)))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
