'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, Loader2, CreditCard as CreditCardIcon, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import {
  createCreditCardAction,
  updateCreditCardAction,
  deleteCreditCardAction,
} from '@/app/actions/credit-cards'
import { creditCardSchema, type CreditCardInput } from '@/lib/validations/credit-card'
import type { CreditCard } from '@/types'
import { toast } from 'sonner'

interface CreditCardsManagerProps {
  cards: CreditCard[]
}

export function CreditCardsManager({ cards }: CreditCardsManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditCardInput>({
    resolver: zodResolver(creditCardSchema) as never,
    defaultValues: {
      name: '',
      issuer: '',
    },
  })

  function openNewCard() {
    setEditingCard(null)
    reset({
      name: '',
      issuer: '',
      spending_cap: undefined,
      closing_day: undefined,
      due_day: undefined,
    })
    setShowModal(true)
  }

  function openEditCard(card: CreditCard) {
    setEditingCard(card)
    reset({
      name: card.name,
      issuer: card.issuer ?? '',
      spending_cap: card.spending_cap ?? undefined,
      closing_day: card.closing_day ?? undefined,
      due_day: card.due_day ?? undefined,
    })
    setShowModal(true)
  }

  function handleFormSubmit(data: CreditCardInput) {
    startTransition(async () => {
      const payload = {
        name: data.name,
        issuer: data.issuer,
        spending_cap: data.spending_cap,
        closing_day: data.closing_day,
        due_day: data.due_day,
      }

      if (editingCard) {
        const result = await updateCreditCardAction(editingCard.id, payload)
        if (result?.error) {
          toast.error('Erro ao atualizar cartão.')
          return
        }
        toast.success('Cartão atualizado!')
      } else {
        const result = await createCreditCardAction(payload)
        if (result?.error) {
          toast.error('Erro ao criar cartão.')
          return
        }
        toast.success('Cartão criado com sucesso!')
      }

      reset()
      setShowModal(false)
      setEditingCard(null)
    })
  }

  function handleDelete(card: CreditCard) {
    startTransition(async () => {
      const result = await deleteCreditCardAction(card.id)
      if (result?.error) {
        toast.error('Erro ao excluir cartão.')
        return
      }
      toast.success('Cartão desativado.')
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Cartões de crédito</h2>
        <button
          onClick={openNewCard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Nenhum cartão cadastrado. Clique em &ldquo;Adicionar&rdquo; para criar.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <CreditCardIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{card.name}</p>
                <p className="text-xs text-gray-400">
                  {card.issuer || 'Sem emissor'}
                  {card.spending_cap != null && (
                    <span className="ml-1">· Teto: {formatCurrency(card.spending_cap)}</span>
                  )}
                  {card.closing_day != null && (
                    <span className="ml-1">· Fecha dia {card.closing_day}</span>
                  )}
                  {card.due_day != null && (
                    <span className="ml-1">· Vence dia {card.due_day}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => openEditCard(card)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Editar cartão"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(card)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                aria-label="Excluir cartão"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCard ? 'Editar cartão' : 'Novo cartão'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú Personnalité..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emissor (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mastercard, Visa..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  {...register('issuer')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teto de gasto (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('spending_cap')}
                  />
                </div>
                {errors.spending_cap && (
                  <p className="text-red-500 text-xs mt-1">{errors.spending_cap.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia de fechamento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ex: 28"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('closing_day')}
                  />
                  {errors.closing_day && (
                    <p className="text-red-500 text-xs mt-1">{errors.closing_day.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia de vencimento
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ex: 5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('due_day')}
                  />
                  {errors.due_day && (
                    <p className="text-red-500 text-xs mt-1">{errors.due_day.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
