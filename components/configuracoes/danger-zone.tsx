'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Trash2, UserX, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { clearHouseholdDataAction, deleteAccountAction } from '@/app/actions/household'
import { cn } from '@/lib/utils'

export function DangerZone() {
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, startDeleteTransition] = useTransition()
  const router = useRouter()

  const CONFIRM_WORD = 'apagartudo'
  const DELETE_CONFIRM_WORD = 'apagarconta'
  const isConfirmed = confirmText === CONFIRM_WORD
  const isDeleteConfirmed = deleteConfirmText === DELETE_CONFIRM_WORD

  function handleOpen() {
    setConfirmText('')
    setShowModal(true)
  }

  function handleClose() {
    if (isPending) return
    setConfirmText('')
    setShowModal(false)
  }

  function handleConfirm() {
    if (!isConfirmed || isPending) return
    startTransition(async () => {
      const result = await clearHouseholdDataAction()
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Todos os dados foram apagados.')
      setShowModal(false)
      router.push('/')
      router.refresh()
    })
  }

  function handleDeleteOpen() {
    setDeleteConfirmText('')
    setShowDeleteAccount(true)
  }

  function handleDeleteClose() {
    if (isDeleting) return
    setDeleteConfirmText('')
    setShowDeleteAccount(false)
  }

  function handleDeleteConfirm() {
    if (!isDeleteConfirmed || isDeleting) return
    startDeleteTransition(async () => {
      const result = await deleteAccountAction()
      if (result?.error) {
        toast.error(result.error)
        return
      }
    })
  }

  return (
    <>
      <div className="rounded-2xl border border-[#fecaca] dark:border-[#ef4444]/30 bg-[#fff5f5] dark:bg-[#ef4444]/5 overflow-hidden">
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fee2e2] dark:bg-[#ef4444]/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-[#dc2626] dark:text-[#f87171]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-0.5">
              Zona de perigo
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ações irreversíveis que afetam todos os membros da casa.
              Tenha certeza antes de continuar.
            </p>
          </div>
        </div>

        <div className="border-t border-[#fecaca] dark:border-[#ef4444]/20 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Limpar todos os dados
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Remove transações, contas, planejamentos, metas,
              investimentos e dívidas permanentemente.
            </p>
          </div>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ef4444]/40 text-[#dc2626] dark:text-[#f87171] text-sm font-medium hover:bg-[#fee2e2] dark:hover:bg-[#ef4444]/10 transition-colors shrink-0"
          >
            <Trash2 size={14} />
            Limpar dados
          </button>
        </div>

        <div className="border-t border-[#fecaca] dark:border-[#ef4444]/20 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Apagar minha conta</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Remove seus dados pessoais e acesso permanentemente.
              Os outros membros da casa não são afetados.
            </p>
          </div>
          <button
            onClick={handleDeleteOpen}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ef4444]/40 text-[#dc2626] dark:text-[#f87171] text-sm font-medium hover:bg-[#fee2e2] dark:hover:bg-[#ef4444]/10 transition-colors shrink-0"
          >
            <UserX size={14} />
            Apagar conta
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-theme-lg">

            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fee2e2] dark:bg-[#ef4444]/15 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-[#dc2626] dark:text-[#f87171]" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Limpar todos os dados
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#fff5f5] dark:bg-[#ef4444]/8 border border-[#fecaca] dark:border-[#ef4444]/25 space-y-2">
                <p className="text-sm font-semibold text-[#dc2626] dark:text-[#f87171]">
                  Esta ação não pode ser desfeita
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Todos os dados da casa serão permanentemente apagados:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-none">
                  {[
                    'Todas as transações',
                    'Todas as contas recorrentes',
                    'Todos os planejamentos',
                    'Todas as metas financeiras',
                    'Todos os investimentos',
                    'Todas as dívidas',
                    'Todos os cartões de crédito',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Seus usuários e configurações serão mantidos.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Para confirmar, digite{' '}
                  <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[#dc2626] dark:text-[#f87171] text-xs border border-[#fecaca] dark:border-[#ef4444]/20">
                    apagartudo
                  </code>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="apagartudo"
                  disabled={isPending}
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    'w-full h-11 px-4 rounded-lg border text-sm font-mono',
                    'bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none transition-colors disabled:opacity-50',
                    isConfirmed
                      ? 'border-[#22c55e] focus:border-[#22c55e]'
                      : 'border-border focus:border-ring'
                  )}
                />
                {isConfirmed && (
                  <p className="text-xs text-[#16a34a] dark:text-[#4ade80] mt-1.5 flex items-center gap-1">
                    Confirmação aceita
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 h-11 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmed || isPending}
                className={cn(
                  'flex-1 h-11 rounded-lg text-sm font-semibold transition-colors',
                  isConfirmed && !isPending
                    ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {isPending ? 'Apagando...' : 'Apagar tudo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleDeleteClose() }}
        >
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-theme-lg">

            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fee2e2] dark:bg-[#ef4444]/15 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-[#dc2626] dark:text-[#f87171]" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Apagar minha conta
                </h2>
              </div>
              <button
                onClick={handleDeleteClose}
                disabled={isDeleting}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#fff5f5] dark:bg-[#ef4444]/8 border border-[#fecaca] dark:border-[#ef4444]/25 space-y-2">
                <p className="text-sm font-semibold text-[#dc2626] dark:text-[#f87171]">
                  Esta ação não pode ser desfeita
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sua conta e todos os dados vinculados serão permanentemente apagados:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-none">
                  {[
                    'Sua conta de acesso',
                    'Todas as transações',
                    'Todas as contas recorrentes',
                    'Todos os planejamentos',
                    'Todas as metas financeiras',
                    'Todos os investimentos',
                    'Todas as dívidas',
                    'Todos os cartões de crédito',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Você será redirecionado para a página de login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Para confirmar, digite{' '}
                  <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[#dc2626] dark:text-[#f87171] text-xs border border-[#fecaca] dark:border-[#ef4444]/20">
                    apagarconta
                  </code>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="apagarconta"
                  disabled={isDeleting}
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    'w-full h-11 px-4 rounded-lg border text-sm font-mono',
                    'bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none transition-colors disabled:opacity-50',
                    isDeleteConfirmed
                      ? 'border-[#22c55e] focus:border-[#22c55e]'
                      : 'border-border focus:border-ring'
                  )}
                />
                {isDeleteConfirmed && (
                  <p className="text-xs text-[#16a34a] dark:text-[#4ade80] mt-1.5 flex items-center gap-1">
                    Confirmação aceita
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={handleDeleteClose}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!isDeleteConfirmed || isDeleting}
                className={cn(
                  'flex-1 h-11 rounded-lg text-sm font-semibold transition-colors',
                  isDeleteConfirmed && !isDeleting
                    ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {isDeleting ? 'Apagando...' : 'Apagar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
