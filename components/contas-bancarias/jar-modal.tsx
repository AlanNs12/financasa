'use client'

import { useEffect, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { savingsJarSchema } from '@/lib/validations/savings-jar'
import { createJarAction, updateJarAction } from '@/app/actions/savings'
import type { AccountWithBalance, SavingsJarWithBalance } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from './account-meta'

const formSchema = savingsJarSchema.extend({
  initial_amount: z.coerce.number().min(0).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface JarModalProps {
  isOpen: boolean
  onClose: () => void
  account: AccountWithBalance
  editingJar: SavingsJarWithBalance | null
}

export function JarModal({ isOpen, onClose, account, editingJar }: JarModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      name: '',
      account_id: account.id,
      target_amount: undefined,
      color: ACCOUNT_COLORS[0],
      icon: ACCOUNT_ICONS[0],
      initial_amount: undefined,
    },
  })

  const color = useWatch({ control, name: 'color' })
  const icon = useWatch({ control, name: 'icon' })

  useEffect(() => {
    if (!isOpen) return
    if (editingJar) {
      reset({
        name: editingJar.name,
        account_id: editingJar.account_id,
        target_amount: editingJar.target_amount ?? undefined,
        color: editingJar.color ?? ACCOUNT_COLORS[0],
        icon: editingJar.icon ?? ACCOUNT_ICONS[0],
        initial_amount: undefined,
      })
    } else {
      reset({
        name: '',
        account_id: account.id,
        target_amount: undefined,
        color: ACCOUNT_COLORS[0],
        icon: ACCOUNT_ICONS[0],
        initial_amount: undefined,
      })
    }
  }, [isOpen, editingJar, account.id, reset])

  function handleFormSubmit(data: FormValues) {
    startTransition(async () => {
      const result = editingJar
        ? await updateJarAction(editingJar.id, {
            name: data.name,
            target_amount: data.target_amount ?? null,
            color: data.color ?? null,
            icon: data.icon ?? null,
          })
        : await createJarAction({
            name: data.name,
            account_id: account.id,
            target_amount: data.target_amount,
            color: data.color,
            icon: data.icon,
            initial_amount: data.initial_amount,
          })

      if (result?.error) {
        toast.error('Erro ao salvar cofrinho. Verifique os campos.')
        return
      }

      toast.success(editingJar ? 'Cofrinho atualizado!' : 'Cofrinho criado!')
      reset()
      onClose()
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingJar ? 'Editar cofrinho' : 'Novo cofrinho'}
    >
      <p className="text-xs text-muted-foreground -mt-1 mb-4">
        Vinculado à conta <span className="font-medium text-foreground">{account.name}</span> · disponível{' '}
        {formatCurrency(account.available)}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <input type="hidden" {...register('account_id')} />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
          <input
            type="text"
            placeholder="Ex: Reserva de emergência"
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
            {...register('name')}
          />
          {errors.name && <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Meta (opcional)
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
              {...register('target_amount')}
            />
          </div>
          {errors.target_amount && (
            <p className="text-error-500 text-xs mt-1">{errors.target_amount.message}</p>
          )}
        </div>

        {!editingJar && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Guardar agora (opcional)
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
                {...register('initial_amount')}
              />
            </div>
            {errors.initial_amount && (
              <p className="text-error-500 text-xs mt-1">{errors.initial_amount.message}</p>
            )}
          </div>
        )}

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
    </Modal>
  )
}
