'use client'

import { useState } from 'react'
import { X, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionInput } from '@/lib/validations/transaction'

const CATEGORIES = {
  INCOME: [
    { id: 'cat-salary', name: 'Salário', icon: '💰', color: '#22c55e' },
    { id: 'cat-freelance', name: 'Freelance', icon: '💻', color: '#10b981' },
    { id: 'cat-investment', name: 'Investimentos', icon: '📈', color: '#06b6d4' },
  ],
  EXPENSE: [
    { id: 'cat-housing', name: 'Moradia', icon: '🏠', color: '#6366f1' },
    { id: 'cat-food', name: 'Alimentação', icon: '🛒', color: '#f59e0b' },
    { id: 'cat-transport', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
    { id: 'cat-health', name: 'Saúde', icon: '💊', color: '#ef4444' },
    { id: 'cat-education', name: 'Educação', icon: '📚', color: '#8b5cf6' },
    { id: 'cat-leisure', name: 'Lazer', icon: '🎮', color: '#ec4899' },
    { id: 'cat-subscriptions', name: 'Assinaturas', icon: '📱', color: '#14b8a6' },
    { id: 'cat-shopping', name: 'Compras', icon: '🛍️', color: '#f97316' },
    { id: 'cat-other', name: 'Outros', icon: '💼', color: '#6b7280' },
  ],
}

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'Pix' },
  { id: 'CREDIT_CARD', label: 'Crédito' },
  { id: 'DEBIT_CARD', label: 'Débito' },
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'BANK_TRANSFER', label: 'Transf.' },
  { id: 'BOLETO', label: 'Boleto' },
]

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [showNotes, setShowNotes] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: 'EXPENSE',
      payment_method: 'PIX',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const categoryId = watch('category_id')

  function onSubmit() {
    const data = { type, amount: 0, description: '', date: '', category_id: '', payment_method: 'PIX' as const }
    console.log('New transaction:', data)
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">Nova transação</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setValue('type', t)
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  type === t
                    ? t === 'EXPENSE'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-500'
                )}
              >
                {t === 'EXPENSE' ? (
                  <ArrowDownCircle className="w-4 h-4" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                {t === 'EXPENSE' ? 'Saída' : 'Entrada'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                R$
              </span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-lg font-bold"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              {...register('description')}
              type="text"
              placeholder="Ex: Mercado, Uber, Salário..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
              <select
                {...register('payment_method')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES[type].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue('category_id', cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                    categoryId === cat.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] text-gray-600 text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {showNotes ? '- Ocultar observação' : '+ Adicionar observação'}
            </button>
            {showNotes && (
              <textarea
                {...register('notes')}
                placeholder="Observação opcional..."
                rows={2}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm resize-none"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
