import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('aceita email e senha válidos', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 6 caracteres', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita email vazio', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '123456',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validData = {
    name: 'Ana Teste',
    email: 'ana@example.com',
    password: '123456',
    confirmPassword: '123456',
  }

  it('aceita input válido', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    const result = registerSchema.safeParse({ ...validData, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejeita email inválido', () => {
    const result = registerSchema.safeParse({ ...validData, email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha com menos de 6 caracteres', () => {
    const result = registerSchema.safeParse({ ...validData, password: '12345', confirmPassword: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejeita senhas não conferentes', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: '123456',
      confirmPassword: '654321',
    })
    expect(result.success).toBe(false)
  })

  it('aceita invite_code opcional', () => {
    const result = registerSchema.safeParse({ ...validData, invite_code: 'ABC123' })
    expect(result.success).toBe(true)
  })
})
