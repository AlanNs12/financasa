'use client'

import { useEffect, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { accountSchema, type AccountInput } from '@/lib/validations/account'
import { createAccountAction, updateAccountAction } from '@/app/actions/accounts'
import type { Account } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_COLORS,
  ACCOUNT_ICONS,
} from './account-meta'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  editingAccount: Account | null
}

export function AccountModal({ isOpen, onClose, editingAccount }: AccountModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema) as never,
    defaultValues: {
      name: '',
      type: 'CHECKING',
      institution: '',
      initial_balance: 0,
      color: ACCOUNT_COLORS[0],
      icon: ACCOUNT_ICONS[0],
    },
  })

  const color = useWatch({ control, name: 'color' })
  const icon = useWatch({ control, name: 'icon' })

  useEffect(() => {
    if (!isOpen) return
    if (editingAccount) {
      reset({
        name: editingAccount.name,
        type: editingAccount.type,
        institution: editingAccount.institution ?? '',
        initial_balance: editingAccount.initial_balance,
        color: editingAccount.color ?? ACCOUNT_COLORS[0],
        icon: editingAccount.icon ?? ACCOUNT_ICONS[0],
      })
    } else {
      reset({
        name: '',
        type: 'CHECKING',
        institution: '',
        initial_balance: 0,
        color: ACCOUNT_COLORS[0],
        icon: ACCOUNT_ICONS[0],
      })
    }
  }, [isOpen, editingAccount, reset])

  if (!isOpen) return null

  function handleFormSubmit(data: AccountInput) {
    startTransition(async () => {
      const payload = {
        name: data.name,
        type: data.type,
        institution: data.institution || undefined,
        initial_balance: Number(data.initial_balance) || 0,
        color: data.color || undefined,
        icon: data.icon || undefined,
      }

      const result = editingAccount
        ? await updateAccountAction(editingAccount.id, payload)
        : await createAccountAction(payload)

      if (result?.error) {
        toast.error('Erro ao salvar conta. Verifique os campos.')
        return
      }

      toast.success(editingAccount ? 'Conta atualizada!' : 'Conta criada com sucesso!')
      reset()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl safe-area-bottom">
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-foreground">
            {editingAccount ? 'Editar conta' : 'Nova conta'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
            <input
              type="text"
              placeholder="Ex: Nubank, Itaú, Carteira..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              {...register('name')}
            />
            {errors.name && <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-background"
              {...register('type')}
            >
              {ACCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Instituição (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Nubank, Bradesco..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              {...register('institution')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Saldo inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                {...register('initial_balance')}
              />
            </div>
            {errors.initial_balance && (
              <p className="text-error-500 text-xs mt-1">{errors.initial_balance.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setValue('icon', i)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all',
                    icon === i ? 'border-foreground bg-muted' : 'border-border'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
