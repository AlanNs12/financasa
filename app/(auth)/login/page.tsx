'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { signIn, resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Eye, EyeOff, Wallet, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetPending, startResetTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginInput) {
    setError(null)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    startTransition(() => {
      signIn(formData).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    startResetTransition(async () => {
      const result = await resetPasswordAction(resetEmail)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Link enviado! Verifique seu email.')
      setShowResetForm(false)
    })
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-muted-foreground mt-1">Acesse seu controle financeiro</p>
      </div>

      {confirmed === 'true' && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm flex items-center gap-2 justify-center">
          <CheckCircle className="w-4 h-4" />
          Email confirmado! Faça login para continuar.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="seu@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
          <button
            type="button"
            onClick={() => setShowResetForm(true)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors"
          >
            Esqueceu sua senha?
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {showResetForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResetForm(false)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-sm shadow-xl p-6">
            <button
              onClick={() => setShowResetForm(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </button>
            <h2 className="text-lg font-bold text-foreground mb-1">Recuperar senha</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              />
              <button
                type="submit"
                disabled={isResetPending}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isResetPending ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-foreground font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
