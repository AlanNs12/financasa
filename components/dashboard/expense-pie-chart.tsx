'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/format'

interface CategoryExpense {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  percentage: number
}

const FALLBACK_COLORS = [
  '#0F1115',
  '#2D2F36',
  '#6B7280',
  '#22C55E',
  '#EF4444',
  '#3B82F6',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#10B981',
  '#F97316',
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryExpense }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-theme-md text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span>{d.categoryIcon}</span>
        <span className="font-medium text-foreground">{d.categoryName}</span>
      </div>
      <p className="text-foreground font-bold">{formatCurrency(d.amount)}</p>
      <p className="text-muted-foreground text-xs">{d.percentage.toFixed(1)}%</p>
    </div>
  )
}

export function ExpensePieChart({
  data,
}: {
  data: Array<{
    categoryId: string
    categoryName: string
    icon: string
    color: string
    total: number
  }>
}) {
  const total = data.reduce((s, d) => s + d.total, 0)

  const enriched: CategoryExpense[] = data.map((d) => ({
    categoryId: d.categoryId,
    categoryName: d.categoryName,
    categoryIcon: d.icon,
    categoryColor: d.color,
    amount: d.total,
    percentage: total > 0 ? (d.total / total) * 100 : 0,
  }))

  if (enriched.length === 0) return null

  const TOP_N = 6
  const topData = enriched.slice(0, TOP_N)
  const otherSum = enriched.slice(TOP_N).reduce((s, d) => s + d.amount, 0)
  const chartData =
    otherSum > 0
      ? [
          ...topData,
          {
            categoryId: 'outros',
            categoryName: 'Outros',
            categoryIcon: '📦',
            categoryColor: '#6B7280',
            amount: otherSum,
            percentage: (otherSum / total) * 100,
          },
        ]
      : topData

  return (
    <div className="rounded-2xl border border-border bg-card shadow-theme-xs p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Gastos por categoria
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                dataKey="amount"
                nameKey="categoryName"
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={entry.categoryId}
                    fill={
                      entry.categoryColor ||
                      FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2">
          {chartData.map((d, i) => (
            <div key={d.categoryId} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    d.categoryColor ||
                    FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                }}
              />
              <span className="text-sm text-foreground flex-1 truncate">
                {d.categoryIcon} {d.categoryName}
              </span>
              <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                {formatCurrency(d.amount)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
                {d.percentage.toFixed(0)}%
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
