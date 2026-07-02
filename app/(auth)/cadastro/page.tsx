'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { Eye, EyeOff, Wallet, Users, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isJoining, setIsJoining] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterInput) {
    setError(null)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (isJoining && data.invite_code) {
      formData.append('invite_code', data.invite_code)
    }
    startTransition(() => {
      signUp(formData).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="text-muted-foreground mt-1">Comece a gerenciar suas finanças</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex bg-secondary rounded-xl p-1 mb-4">
        <button
          type="button"
          onClick={() => setIsJoining(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            !isJoining ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Nova casa
        </button>
        <button
          type="button"
          onClick={() => setIsJoining(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            isJoining ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Entrar em casa
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Nome
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Confirmar senha
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Repita a senha"
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {isJoining && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Código de convite
            </label>
            <input
              {...register('invite_code')}
              type="text"
              placeholder="Ex: A4K9M2"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-colors text-sm uppercase tracking-widest text-center font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Peça o código para quem já está na casa
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-foreground font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
