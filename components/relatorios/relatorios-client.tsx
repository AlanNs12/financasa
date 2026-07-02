'use client'

import { useState } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { EmptyState } from '@/components/shared/empty-state'
import { PieChart as PieChartIcon, TrendingUp, BarChart3, Printer } from 'lucide-react'
import type {
  ExpenseByCategory,
  MonthlyEvolutionPoint,
  PlannedVsActual,
} from '@/lib/db/queries/reports'

const FALLBACK_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6b7280',
]

type Tab = 'categories' | 'evolution' | 'budget'

interface RelatoriosClientProps {
  expensesByCategory: ExpenseByCategory[]
  monthlyEvolution: MonthlyEvolutionPoint[]
  plannedVsActual: PlannedVsActual[]
  month: number
  year: number
}

export function RelatoriosClient({
  expensesByCategory,
  monthlyEvolution,
  plannedVsActual,
  month,
  year,
}: RelatoriosClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('categories')
  const monthName = getMonthName(month)

  const totalExpenses = expensesByCategory.reduce(
    (sum, c) => sum + c.total,
    0
  )

  const evolutionHasData = monthlyEvolution.some(
    (p) => p.income > 0 || p.expense > 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise financeira detalhada</p>
        </div>
        <button
          onClick={() => window.open(`/relatorios/imprimir?month=${month}&year=${year}`, '_blank')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-card border border-border hover:bg-accent transition-colors shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimir / PDF
        </button>
      </div>

      <div className="flex bg-card rounded-xl border border-border p-1">
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
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-4">
          {expensesByCategory.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <EmptyState
                icon={PieChartIcon}
                title="Nenhum gasto no mês"
                description={`Não há transações de saída registradas em ${monthName.toLowerCase()}/${year}.`}
              />
            </div>
          ) : (
            <>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  Distribuição de gastos · {monthName}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="total"
                        nameKey="categoryName"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell
                            key={entry.categoryId}
                            fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                          />
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

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="space-y-3">
                  {expensesByCategory.map((cat, idx) => {
                    const pct = Math.round((cat.total / totalExpenses) * 100)
                    return (
                      <div key={cat.categoryId} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              cat.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
                          }}
                        />
                        <span className="flex-1 text-sm text-muted-foreground">
                          {cat.icon} {cat.categoryName}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(cat.total)}
                        </span>
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'evolution' && (
        <div className="space-y-4">
          {!evolutionHasData ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <EmptyState
                icon={TrendingUp}
                title="Sem dados para exibir"
                description="Não há transações registradas nos últimos 6 meses para gerar a evolução."
              />
            </div>
          ) : (
            <>
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  Receitas vs Gastos
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `R$${v / 1000}k`}
                      />
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
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Gastos"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  Resumo mensal
                </h2>
                <div className="space-y-2">
                  {monthlyEvolution.map((m) => (
                    <div
                      key={`${m.year}-${m.month}`}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(m.income)}
                        </span>
                        <span className="text-sm text-red-500 font-medium">
                          {formatCurrency(m.expense)}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            m.income - m.expense >= 0
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(m.income - m.expense)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-6">
            Planejado x Realizado · {monthName}
          </h2>
          {plannedVsActual.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Nenhum planejamento no mês"
              description={`Não há categorias planejadas em ${monthName.toLowerCase()}/${year}. Acesse a página de Planejamento para criar seu orçamento.`}
            />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={plannedVsActual}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar
                    dataKey="planned"
                    name="Planejado"
                    fill="#94a3b8"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="actual"
                    name="Realizado"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
