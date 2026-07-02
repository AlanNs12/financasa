'use client'

import { formatCurrency, formatPercentage } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface MonthlyBudgetCardProps {
  month: string
  balance: number
  spent: number
  totalBudget: number
  percentage: number
}

export function MonthlyBudgetCard({ month, balance, spent, totalBudget, percentage }: MonthlyBudgetCardProps) {
  return (
    <div className="bg-[#1a1a2e] dark:bg-gradient-to-br dark:from-[#161b22] dark:to-[#0d1117] dark:border dark:border-[#30363d] rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/70">Orçamento Mensal</span>
          <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-lg">{month}</span>
        </div>

        <p className="text-3xl font-bold tracking-tight mb-1">
          {formatCurrency(balance)}
        </p>
        <p className="text-sm text-white/50 mb-4">saldo disponível</p>

        <ProgressBar value={spent} max={totalBudget} size="sm" className="mb-2" />

        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-white/70">
            Gasto: {formatCurrency(spent)}
          </span>
          <span className="text-white/50">
            Meta: {formatCurrency(totalBudget)}
          </span>
        </div>

        <Link
          href="/planejamento"
          className="inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Ver detalhes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
