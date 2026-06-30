'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryBill {
  id: string
  name: string
  amount: number
  due_day: number
  status: string
  paid_at: string | null
}

interface MonthHistory {
  month: number
  year: number
  total: number
  paid: number
  pending: number
  percentage: number
  bills: HistoryBill[]
}

interface BillsHistoryProps {
  history: MonthHistory[]
  currentMonth: number
  currentYear: number
}

function getBillStatus(status: string): 'paid' | 'pending' | 'overdue' {
  if (status === 'PAID') return 'paid'
  if (status === 'OVERDUE') return 'overdue'
  return 'pending'
}

function extractIcon(name: string): string {
  const match = name.match(/^(\S+)/)
  if (match && /[^a-zA-Z0-9]/.test(match[1])) return match[1]
  return '📄'
}

function extractName(name: string): string {
  return name.replace(/^\S+\s+/, '')
}

export function BillsHistory({ history, currentMonth, currentYear }: BillsHistoryProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  function toggleMonth(key: string) {
    const next = new Set(expandedMonths)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setExpandedMonths(next)
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-400 text-sm">Nenhum histórico disponível</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((h) => {
        const key = `${h.year}-${h.month}`
        const isExpanded = expandedMonths.has(key)
        const monthName = getMonthName(h.month)

        return (
          <div
            key={key}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => toggleMonth(key)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {monthName} {h.year}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <ProgressBar value={h.paid} max={h.total} size="sm" className="w-24" />
                  <span className="text-xs text-gray-400">{h.percentage}% pago</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(h.total)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(h.paid)} pago
                </p>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {h.bills.map((bill) => {
                  const status = getBillStatus(bill.status)
                  const icon = extractIcon(bill.name)
                  const name = extractName(bill.name)

                  return (
                    <div
                      key={bill.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="text-lg">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Vence dia {bill.due_day.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatCurrency(bill.amount)}
                        </p>
                        <StatusBadge status={status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
