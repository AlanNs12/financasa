'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Trash2,
  AlertTriangle,
  Calculator,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/format'
import { EmptyState } from '@/components/shared/empty-state'
import { createInvestmentAction, deleteInvestmentAction } from '@/app/actions/investments'
import { investmentSchema, type InvestmentInput } from '@/lib/validations/investment'
import type { Investment, InvestmentType, FinancialGoal } from '@/types'
import type { InvestmentSummary, InvestmentByGoal } from '@/lib/db/queries/investments'
import { toast } from 'sonner'

const ASSET_TYPE_LABELS: Record<InvestmentType, string> = {
  RESERVA_EMERGENCIA: 'Reserva de emergência',
  RENDA_FIXA: 'Renda fixa',
  RENDA_VARIAVEL: 'Renda variável',
  PREVIDENCIA: 'Previdência',
  FUNDOS: 'Fundos',
  CRIPTO: 'Cripto',
  OUTROS: 'Outros',
}

const ASSET_TYPE_COLORS: Record<InvestmentType, string> = {
  RESERVA_EMERGENCIA: '#6366f1',
  RENDA_FIXA: '#f59e0b',
  RENDA_VARIAVEL: '#3b82f6',
  PREVIDENCIA: '#8b5cf6',
  FUNDOS: '#14b8a6',
  CRIPTO: '#ec4899',
  OUTROS: '#6b7280',
}

const ASSET_TYPE_OPTIONS = Object.entries(ASSET_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

interface InvestimentosClientProps {
  investments: Investment[]
  summary: InvestmentSummary
  byGoal: InvestmentByGoal[]
  goals: FinancialGoal[]
}

export function InvestimentosClient({
  investments,
  summary,
  byGoal,
  goals,
}: InvestimentosClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Investment | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema) as never,
    defaultValues: {
      name: '',
      asset_type: 'RENDA_FIXA',
      goal_id: undefined,
      applied_at: new Date().toISOString().split('T')[0],
      gross_invested: 0,
      gross_current: 0,
      net_current: 0,
    },
  })

  function handleFormSubmit(data: InvestmentInput) {
    startTransition(async () => {
      const result = await createInvestmentAction({
        name: data.name,
        asset_type: data.asset_type,
        goal_id: data.goal_id || null,
        rate_description: data.rate_description,
        applied_at: data.applied_at,
        maturity_at: data.maturity_at || null,
        gross_invested: data.gross_invested,
        gross_current: data.gross_current,
        net_current: data.net_current,
      })

      if (result?.error) {
        toast.error('Erro ao criar investimento. Verifique os dados.')
        return
      }

      toast.success('Investimento criado com sucesso!')
      reset()
      setShowModal(false)
    })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const inv = pendingDelete
    startTransition(async () => {
      const result = await deleteInvestmentAction(inv.id)
      if (result?.error) {
        toast.error('Erro ao excluir investimento.')
        return
      }
      toast.success('Investimento excluído')
      setPendingDelete(null)
    })
  }

  const hasInvestments = investments.length > 0
  const profitIsPositive = summary.profit >= 0

  const pieData = summary.byAssetType.map((item) => ({
    name: ASSET_TYPE_LABELS[item.asset_type],
    value: item.total,
    color: ASSET_TYPE_COLORS[item.asset_type],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Sua carteira de investimentos</p>
        </div>
        <Link
          href="/investimentos/simulador"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-card border border-border hover:bg-accent transition-colors shrink-0"
        >
          <Calculator className="w-3.5 h-3.5" />
          Simulador
        </Link>
      </div>

      {hasInvestments ? (
        <>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 text-white">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total investido
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {formatCurrency(summary.totalGrossInvested)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Valor atual líquido
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {formatCurrency(summary.totalNetCurrent)}
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profitIsPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs text-muted-foreground">Rentabilidade</span>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      profitIsPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {profitIsPositive ? '+' : ''}
                    {formatCurrency(summary.profit)}
                  </p>
                  <p
                    className={`text-xs tabular-nums ${
                      profitIsPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {profitIsPositive ? '+' : ''}
                    {formatPercentage(summary.profitPercentage)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Distribuição por tipo de ativo
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {summary.byAssetType.map((item) => (
                  <div
                    key={item.asset_type}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: ASSET_TYPE_COLORS[item.asset_type],
                      }}
                    />
                    <span className="flex-1 text-sm text-muted-foreground">
                      {ASSET_TYPE_LABELS[item.asset_type]}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(item.total)}
                    </span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {formatPercentage(item.percentage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {byGoal.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Por objetivo
              </h2>
              <div className="space-y-2">
                {byGoal.map((item) => (
                  <div
                    key={item.goalId ?? '__no_goal__'}
                    className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  >
                    <span className="text-lg">
                      {item.goalIcon || '🎯'}
                    </span>
                    <span className="flex-1 text-sm text-muted-foreground">
                      {item.goalName}
                    </span>
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Investimentos</h2>
            {investments.map((inv) => {
              const gain = inv.gross_current - inv.gross_invested
              const gainPct =
                inv.gross_invested > 0 ? (gain / inv.gross_invested) * 100 : 0
              const gainIsPositive = gain >= 0

              return (
                <div
                  key={inv.id}
                  className="bg-card rounded-2xl border border-border p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {inv.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ASSET_TYPE_LABELS[inv.asset_type]}
                        {inv.goal && (
                          <span className="ml-1">· {inv.goal.icon || '🎯'} {inv.goal.name}</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setPendingDelete(inv)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Excluir investimento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Investido
                      </p>
                      <p className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatCurrency(inv.gross_invested)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Atual
                      </p>
                      <p className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatCurrency(inv.gross_current)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Ganho
                      </p>
                      <p
                        className={`text-xs font-medium tabular-nums ${
                          gainIsPositive ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {gainIsPositive ? '+' : ''}
                        {formatPercentage(gainPct)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">
                      Aplicado em {formatDate(inv.applied_at)}
                    </span>
                    {inv.maturity_at && (
                      <span className="text-[11px] text-muted-foreground">
                        · Vence em {formatDate(inv.maturity_at)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm hover:border-muted-foreground hover:text-muted-foreground transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo investimento
          </button>
        </>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6">
          <EmptyState
            icon={PieChartIcon}
            title="Nenhum investimento cadastrado"
            description="Cadastre seu primeiro investimento para acompanhar a evolução da sua carteira."
            action={
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo investimento
              </button>
            }
          />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-foreground">Novo investimento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Tesouro Selic 2029"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo de ativo</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-card"
                  {...register('asset_type')}
                >
                  {ASSET_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.asset_type && (
                  <p className="text-red-500 text-xs mt-1">{errors.asset_type.message}</p>
                )}
              </div>

              {goals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Objetivo (opcional)
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-card"
                    {...register('goal_id')}
                  >
                    <option value="">Sem objetivo</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon || '🎯'} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Data de aplicação
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...register('applied_at')}
                  />
                  {errors.applied_at && (
                    <p className="text-red-500 text-xs mt-1">{errors.applied_at.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Vencimento (opc.)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...register('maturity_at')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Taxa (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 11,15% a.a. Selic"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...register('rate_description')}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Investido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...register('gross_invested')}
                  />
                  {errors.gross_invested && (
                    <p className="text-red-500 text-xs mt-1">{errors.gross_invested.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Bruto atual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...register('gross_current')}
                  />
                  {errors.gross_current && (
                    <p className="text-red-500 text-xs mt-1">{errors.gross_current.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Líquido atual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...register('net_current')}
                  />
                  {errors.net_current && (
                    <p className="text-red-500 text-xs mt-1">{errors.net_current.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isPending && setPendingDelete(null)}
          />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm p-6 shadow-xl">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                Excluir este investimento?
              </h2>
              <p className="text-sm text-muted-foreground">
                {pendingDelete.name} · {formatCurrency(pendingDelete.net_current)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
