'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { signIn, resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')
  const registered = searchParams.get('registered') === 'true'
  const deleted = searchParams.get('deleted') === 'true'
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
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-muted-foreground text-sm">
          Entre com seu email e senha para acessar
        </p>
      </div>

      {deleted && (
        <div className="p-4 rounded-xl bg-[#f3f4f6] dark:bg-[#2D2F36]
                        border border-border mb-6">
          <p className="text-sm text-foreground font-medium">
            Conta apagada com sucesso.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todos os seus dados foram removidos permanentemente.
          </p>
        </div>
      )}

      {registered && (
        <div className="flex items-start gap-3 p-4 rounded-xl
                        bg-[#dcfce7] dark:bg-[#22c55e]/10
                        border border-[#bbf7d0] dark:border-[#22c55e]/25 mb-6">
          <span className="text-[#16a34a] text-lg shrink-0">✓</span>
          <div>
            <p className="text-sm font-semibold text-[#15803d] dark:text-[#4ade80]">
              Conta criada com sucesso!
            </p>
            <p className="text-xs text-[#166534] dark:text-[#86efac] mt-0.5">
              Enviamos um email de confirmação. Verifique sua caixa de entrada
              (e a pasta de spam) antes de fazer login.
            </p>
          </div>
        </div>
      )}

      {confirmed === 'true' && (
        <div className="mb-4 p-3 rounded-lg bg-success-50 border border-success-500/30 text-success-600 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Email confirmado! Faça login para continuar.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-500/30 text-error-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="seu@email.com"
            className="w-full h-11 px-4 rounded-lg border border-border
                       bg-background text-foreground text-sm
                       placeholder:text-muted-foreground"
          />
          {errors.email && (
            <p className="text-error-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="text-xs text-primary hover:text-primary/80
                         transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              className="w-full h-11 px-4 rounded-lg border border-border
                         bg-background text-foreground text-sm
                         placeholder:text-muted-foreground pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-error-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 mt-6 rounded-lg bg-primary text-primary-foreground
                     font-semibold text-sm hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                className="w-full h-11 px-4 rounded-lg border border-border
                           bg-background text-foreground text-sm
                           placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={isResetPending}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground
                           font-semibold text-sm hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]
                           disabled:opacity-50 transition-colors shadow-theme-xs
                           flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {isResetPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isResetPending ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        Não tem uma conta?{' '}
        <Link href="/cadastro"
              className="text-primary hover:text-primary/80 font-medium
                         transition-colors">
          Criar conta
        </Link>
      </p>
    </>
  )
}
