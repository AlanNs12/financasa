'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Criar conta
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure sua conta e convide sua família
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-500/30 text-error-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex rounded-lg border border-border p-1 mb-6 bg-muted/40">
        <button
          type="button"
          onClick={() => setIsJoining(false)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all',
            !isJoining
              ? 'bg-card text-foreground shadow-theme-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <UserPlus className="w-4 h-4" />
          Nova casa
        </button>
        <button
          type="button"
          onClick={() => setIsJoining(true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all',
            isJoining
              ? 'bg-card text-foreground shadow-theme-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4" />
          Tenho um convite
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nome
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Seu nome completo"
            className="w-full h-11 px-4 rounded-lg border border-border
                       bg-background text-foreground text-sm
                       placeholder:text-muted-foreground"
          />
          {errors.name && (
            <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

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
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Confirmar senha
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Repita a senha"
            className="w-full h-11 px-4 rounded-lg border border-border
                       bg-background text-foreground text-sm
                       placeholder:text-muted-foreground"
          />
          {errors.confirmPassword && (
            <p className="text-error-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {isJoining && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Código de convite
            </label>
            <input
              {...register('invite_code')}
              type="text"
              placeholder="Ex: A4K9M2"
              maxLength={6}
              className="w-full h-11 px-4 rounded-lg border border-border
                         bg-background text-foreground text-sm
                         placeholder:text-muted-foreground uppercase tracking-widest text-center font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Peça o código para quem já está na casa
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 mt-6 rounded-lg bg-primary text-primary-foreground
                     font-semibold text-sm hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Já tem conta?{' '}
        <Link href="/login"
              className="text-primary hover:text-primary/80 font-medium
                         transition-colors">
          Entrar
        </Link>
      </p>
    </>
  )
}
