'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Key, ChevronDown } from 'lucide-react'
import { updatePasswordAction } from '@/app/actions/auth'

export function PasswordManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirm) {
      toast.error('As senhas não conferem')
      return
    }
    startTransition(async () => {
      const result = await updatePasswordAction('', newPassword)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Senha atualizada!')
      setNewPassword('')
      setConfirm('')
      setIsOpen(false)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
        aria-label="Gerenciar senha"
      >
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Key size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Alterar senha</p>
          <p className="text-xs text-muted-foreground">
            Atualize sua senha de acesso
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Nova senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a nova senha"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
