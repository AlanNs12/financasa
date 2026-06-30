'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Info, Save, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { runSimulation } from '@/lib/calculations/retirement'
import type { ProductType } from '@/lib/calculations/retirement'
import { createGoalAction } from '@/app/actions/goals'
import { toast } from 'sonner'

const PRODUCT_LABELS: Record<ProductType, string> = {
  VGBL: 'VGBL',
  PGBL: 'PGBL',
  OUTROS: 'Outros',
}

const PRODUCT_DESCRIPTIONS: Record<ProductType, string> = {
  VGBL: 'Tributa só os rendimentos',
  PGBL: 'Tributa o valor total resgatado',
  OUTROS: 'IR 15% sobre rendimentos',
}

export function SimuladorClient() {
  const [initialValue, setInitialValue] = useState(1000)
  const [monthlyContribution, setMonthlyContribution] = useState(550)
  const [years, setYears] = useState(35)
  const [annualRate, setAnnualRate] = useState(9.5)
  const [isPending, startTransition] = useTransition()

  const months = years * 12

  const simulation = useMemo(
    () => runSimulation({ initialValue, monthlyContribution, annualRate, months }),
    [initialValue, monthlyContribution, annualRate, months]
  )

  const chartData = useMemo(() => {
    const step = months > 120 ? 12 : 1
    return simulation.points
      .filter((p) => p.month % step === 0)
      .map((p) => ({
        label: `Ano ${Math.floor(p.month / 12)}`,
        contributed: Math.round(p.contributed),
        earnings: Math.round(p.earnings),
      }))
  }, [simulation, months])

  const deadlineDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + years)
    return d.toISOString().split('T')[0]
  }, [years])

  function handleSaveAsGoal() {
    startTransition(async () => {
      const result = await createGoalAction({
        name: 'Aposentadoria',
        description: `Meta de aposentadoria: ${formatCurrency(monthlyContribution)}/mês por ${years} anos a ${annualRate}% a.a.`,
        target_amount: Math.round(simulation.grossValue),
        current_amount: initialValue,
        deadline: deadlineDate,
        icon: '🌴',
        color: '#6366f1',
      })

      if (result?.error) {
        toast.error('Erro ao criar meta.')
        return
      }

      toast.success('Meta de aposentadoria criada!')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/investimentos"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Voltar para investimentos"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Simulador de aposentadoria</h1>
          <p className="text-sm text-gray-500">Projeção de juros compostos com aporte mensal</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Estes valores são uma <strong>projeção</strong> e não uma garantia. A rentabilidade real
          pode variar conforme as condições de mercado.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Valor inicial</label>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(initialValue)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={initialValue}
            onChange={(e) => setInitialValue(Number(e.target.value))}
            className="w-full accent-gray-900"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Aporte mensal</label>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(monthlyContribution)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full accent-gray-900"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Prazo</label>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {years} anos
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={45}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-gray-900"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Rentabilidade anual esperada
            </label>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {annualRate.toFixed(1).replace('.', ',')}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full accent-gray-900"
          />
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-2xl p-6 text-white">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Resultado em {years} anos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Valor total acumulado</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(simulation.grossValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total aportado</p>
            <p className="text-lg font-bold tabular-nums text-blue-400">
              {formatCurrency(simulation.totalContributed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Rendimentos</p>
            <p className="text-lg font-bold tabular-nums text-green-400">
              {formatCurrency(simulation.totalEarnings)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Evolução da carteira
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradContributed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                width={60}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="contributed"
                stackId="1"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradContributed)"
                name="Aportado"
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stackId="1"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gradEarnings)"
                name="Rendimentos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366f1' }} />
            <span className="text-xs text-gray-500">Aportado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs text-gray-500">Rendimentos</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Cenários líquidos por tributação
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {simulation.netResults.map((result) => (
            <div
              key={result.productType}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {PRODUCT_LABELS[result.productType]}
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                {PRODUCT_DESCRIPTIONS[result.productType]}
              </p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {formatCurrency(result.netValue)}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">IR estimado</span>
                  <span className="text-red-500 tabular-nums">
                    -{formatCurrency(result.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Rendimentos</span>
                  <span className="text-green-600 tabular-nums">
                    {formatCurrency(result.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSaveAsGoal}
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Salvar como meta de aposentadoria
      </button>
    </div>
  )
}
