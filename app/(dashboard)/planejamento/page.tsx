'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { useMonthStore } from '@/store/month-store'
import { Pencil } from 'lucide-react'

const mockCategories = [
  { id: '1', name: 'Alimentação', icon: '🛒', color: '#f59e0b', planned: 1200, spent: 207.93 },
  { id: '2', name: 'Transporte', icon: '🚗', color: '#3b82f6', planned: 600, spent: 204.90 },
  { id: '3', name: 'Moradia', icon: '🏠', color: '#6366f1', planned: 2500, spent: 0 },
  { id: '4', name: 'Saúde', icon: '💊', color: '#ef4444', planned: 500, spent: 87.50 },
  { id: '5', name: 'Lazer', icon: '🎮', color: '#ec4899', planned: 400, spent: 0 },
  { id: '6', name: 'Assinaturas', icon: '📱', color: '#14b8a6', planned: 200, spent: 21.90 },
  { id: '7', name: 'Compras', icon: '🛍️', color: '#f97316', planned: 300, spent: 0 },
  { id: '8', name: 'Outros', icon: '💼', color: '#6b7280', planned: 200, spent: 0 },
]

export default function PlanejamentoPage() {
  const { month, year } = useMonthStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [totalIncome, setTotalIncome] = useState('8500')

  const monthName = getMonthName(month)
  const totalPlanned = mockCategories.reduce((sum, c) => sum + c.planned, 0)
  const totalSpent = mockCategories.reduce((sum, c) => sum + c.spent, 0)

  const startEdit = (id: string, currentValue: number) => {
    setEditingId(id)
    setEditValue(currentValue.toString())
  }

  const saveEdit = () => {
    console.log('Save:', editingId, editValue)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Planejamento</h1>
        <p className="text-sm text-gray-500">Orçamento por categoria</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Receita total · {monthName}</span>
          <button
            onClick={() => startEdit('income', Number(totalIncome))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">R$</span>
          <span className="text-2xl font-bold text-gray-900">{totalIncome}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Categorias</h2>
          <span className="text-xs text-gray-400">
            {formatCurrency(totalSpent)} de {formatCurrency(totalPlanned)} planejado
          </span>
        </div>

        {mockCategories.map((cat) => {
          const percentage = cat.planned > 0 ? (cat.spent / cat.planned) * 100 : 0
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">
                    Gasto: {formatCurrency(cat.spent)} de {formatCurrency(cat.planned)} planejado
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {Math.round(percentage)}%
                </span>
              </div>
              <ProgressBar value={cat.spent} max={cat.planned} size="sm" />
            </div>
          )
        })}
      </div>

      <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-400 hover:text-gray-700 transition-colors">
        Editar planejamento
      </button>
    </div>
  )
}
