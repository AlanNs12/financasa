'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { useMonthStore } from '@/store/month-store'
import { cn } from '@/lib/utils'

const mockBills = [
  { id: '1', name: 'Aluguel', amount: 1800.00, due_day: 1, recurrence: 'Fixo', status: 'overdue' as const, icon: '🏠' },
  { id: '2', name: 'Internet', amount: 119.90, due_day: 5, recurrence: 'Fixo', status: 'paid' as const, icon: '🌐' },
  { id: '3', name: 'Energia', amount: 235.50, due_day: 15, recurrence: 'Fixo', status: 'pending' as const, icon: '⚡' },
  { id: '4', name: 'Plano de saúde', amount: 420.00, due_day: 20, recurrence: 'Fixo', status: 'pending' as const, icon: '🏥' },
  { id: '5', name: 'Academia', amount: 99.00, due_day: 25, recurrence: 'Fixo', status: 'pending' as const, icon: '🏋️' },
]

export default function ContasPage() {
  const { month, year } = useMonthStore()
  const [expandedBill, setExpandedBill] = useState<string | null>(null)
  const [paidBill, setPaidBill] = useState<string | null>(null)

  const totalAmount = mockBills.reduce((sum, b) => sum + b.amount, 0)
  const paidAmount = mockBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0)
  const remaining = totalAmount - paidAmount
  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

  const monthName = getMonthName(month)

  const handleMarkAsPaid = (billId: string) => {
    setPaidBill(billId)
    setTimeout(() => setPaidBill(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Contas</h1>
        <p className="text-sm text-gray-500">Gerencie suas contas recorrentes</p>
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 text-white">
        <p className="text-sm text-white/70 mb-1">{monthName}</p>
        <p className="text-3xl font-bold mb-1">{formatCurrency(totalAmount)}</p>
        <p className="text-sm text-white/50 mb-4">total de contas</p>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-white/70">{formatCurrency(paidAmount)} pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <span className="text-white/70">{formatCurrency(remaining)} restante</span>
          </div>
        </div>

        <ProgressBar value={paidAmount} max={totalAmount} size="md" />
        <p className="text-xs text-white/50 mt-2">{paidPercentage}% pago</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Este mês</h2>
        {mockBills.map((bill) => {
          const isExpanded = expandedBill === bill.id
          return (
            <div
              key={bill.id}
              className={cn(
                'bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all',
                paidBill === bill.id && 'ring-2 ring-green-400'
              )}
            >
              <button
                onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span className="text-xl">{bill.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{bill.name}</p>
                  <p className="text-xs text-gray-400">
                    {bill.recurrence} · Vence dia {bill.due_day.toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 tabular-nums">
                    {formatCurrency(bill.amount)}
                  </p>
                  <StatusBadge status={paidBill === bill.id ? 'paid' : bill.status} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                  {bill.status !== 'paid' ? (
                    <button
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition-colors"
                    >
                      Marcar como pago
                    </button>
                  ) : (
                    <p className="text-sm text-green-600 text-center font-medium">✓ Pago em 05/06</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
