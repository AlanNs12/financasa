'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('As senhas não conferem')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Senha atualizada com sucesso!')
      router.push('/login')
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center
                            justify-center text-white font-bold text-lg shadow-theme-md">
              F
            </div>
            <span className="text-xl font-semibold text-foreground">
              Financasa
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Nova senha
          </h1>
          <p className="text-muted-foreground text-sm">
            Digite e confirme sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nova senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full h-11 px-4 rounded-lg border border-border
                         bg-background text-foreground text-sm
                         placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              required
              className="w-full h-11 px-4 rounded-lg border border-border
                         bg-background text-foreground text-sm
                         placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-lg bg-brand-500 text-white
                       font-semibold text-sm hover:bg-brand-600 active:bg-brand-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors shadow-theme-xs"
          >
            {isPending ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
