'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { useMonthStore } from '@/store/month-store'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280']

const categoryData = [
  { name: 'Moradia', value: 1800, icon: '🏠', color: '#6366f1' },
  { name: 'Alimentação', value: 277.43, icon: '🛒', color: '#f59e0b' },
  { name: 'Transporte', value: 204.90, icon: '🚗', color: '#3b82f6' },
  { name: 'Saúde', value: 87.50, icon: '💊', color: '#ef4444' },
  { name: 'Assinaturas', value: 21.90, icon: '📱', color: '#14b8a6' },
]

const monthlyData = [
  { month: 'Jan', income: 5000, expenses: 3200 },
  { month: 'Fev', income: 5000, expenses: 2800 },
  { month: 'Mar', income: 6200, expenses: 3400 },
  { month: 'Abr', income: 5000, expenses: 3100 },
  { month: 'Mai', income: 5000, expenses: 2900 },
  { month: 'Jun', income: 6200, expenses: 2391.73 },
]

const budgetVsActual = [
  { name: 'Alimentação', Planejado: 1200, Realizado: 277.43 },
  { name: 'Transporte', Planejado: 600, Realizado: 204.90 },
  { name: 'Moradia', Planejado: 2500, Realizado: 1800 },
  { name: 'Saúde', Planejado: 500, Realizado: 87.50 },
  { name: 'Assinaturas', Planejado: 200, Realizado: 21.90 },
]

type Tab = 'categories' | 'evolution' | 'budget'

export default function RelatoriosPage() {
  const { month, year } = useMonthStore()
  const [activeTab, setActiveTab] = useState<Tab>('categories')
  const monthName = getMonthName(month)

  const totalExpenses = categoryData.reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Relatórios</h1>
        <p className="text-sm text-gray-500">Análise financeira detalhada</p>
      </div>

      <div className="flex bg-white rounded-xl border border-gray-200 p-1">
        {[
          { key: 'categories' as Tab, label: 'Gastos por categoria' },
          { key: 'evolution' as Tab, label: 'Evolução mensal' },
          { key: 'budget' as Tab, label: 'Planejado x Realizado' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Distribuição de gastos · {monthName}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="space-y-3">
              {categoryData.map((cat, idx) => {
                const pct = Math.round((cat.value / totalExpenses) * 100)
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(cat.value)}
                    </span>
                    <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evolution' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Receitas vs Gastos</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Receitas"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Gastos"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Resumo mensal</h2>
            <div className="space-y-2">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{m.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-green-600 font-medium">{formatCurrency(m.income)}</span>
                    <span className="text-sm text-red-500 font-medium">{formatCurrency(m.expenses)}</span>
                    <span className={`text-sm font-medium ${m.income - m.expenses >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(m.income - m.expenses)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Planejado x Realizado · {monthName}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Planejado" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="Realizado" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
