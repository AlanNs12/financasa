'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { useMonthStore } from '@/store/month-store'
import { Plus, X } from 'lucide-react'

const mockGoals = [
  {
    id: '1',
    name: 'Reserva de emergência',
    target_amount: 15000,
    current_amount: 3200,
    deadline: '2025-12-31',
    status: 'in_progress' as const,
    icon: '🛡️',
    color: '#6366f1',
  },
  {
    id: '2',
    name: 'Viagem Europa',
    target_amount: 20000,
    current_amount: 8500,
    deadline: '2026-06-30',
    status: 'in_progress' as const,
    icon: '✈️',
    color: '#ec4899',
  },
  {
    id: '3',
    name: 'Notebook novo',
    target_amount: 5000,
    current_amount: 5000,
    deadline: '2026-03-15',
    status: 'completed' as const,
    icon: '💻',
    color: '#22c55e',
  },
]

const monthlySpent = 477.43
const monthlyBudget = 8500
const monthlyPercentage = Math.round((monthlySpent / monthlyBudget) * 100)
const monthName = getMonthName(new Date().getMonth() + 1)

export default function MetasPage() {
  const [showNewGoal, setShowNewGoal] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Metas</h1>
        <p className="text-sm text-gray-500">Acompanhe seus objetivos financeiros</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gasto</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Do orçamento</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(monthlySpent)}
          </span>
          <span className="text-lg font-bold text-gray-900">{monthlyPercentage}%</span>
        </div>
        <ProgressBar value={monthlySpent} max={monthlyBudget} size="sm" className="mb-2" />
        <p className="text-xs text-gray-400">
          {formatCurrency(monthlySpent)} de {formatCurrency(monthlyBudget)} em {monthName.toLowerCase()}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Metas financeiras</h2>

        {mockGoals.map((goal) => {
          const percentage = Math.round((goal.current_amount / goal.target_amount) * 100)
          const deadline = goal.deadline
            ? new Date(goal.deadline).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
              })
                .replace('.', '/')
                .toUpperCase()
            : null

          return (
            <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    {deadline && <span className="ml-2">· Prazo: {deadline}</span>}
                  </p>
                </div>
                <StatusBadge status={goal.status} />
              </div>
              <ProgressBar value={goal.current_amount} max={goal.target_amount} size="sm" showLabel />
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setShowNewGoal(true)}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nova meta
      </button>

      {showNewGoal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewGoal(false)} />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nova meta</h2>
              <button onClick={() => setShowNewGoal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de emergência"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor meta</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atual</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
