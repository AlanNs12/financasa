import { describe, it, expect } from 'vitest'
import { goalSchema } from '@/lib/validations/goal'

describe('goalSchema', () => {
  const validData = {
    name: 'Reserva de emergência',
    target_amount: 15000,
    current_amount: 3200,
  }

  it('aceita input válido', () => {
    const result = goalSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = goalSchema.safeParse({ ...validData, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita target_amount zero', () => {
    const result = goalSchema.safeParse({ ...validData, target_amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita target_amount negativo', () => {
    const result = goalSchema.safeParse({ ...validData, target_amount: -100 })
    expect(result.success).toBe(false)
  })

  it('rejeita current_amount negativo', () => {
    const result = goalSchema.safeParse({ ...validData, current_amount: -50 })
    expect(result.success).toBe(false)
  })

  it('aceita current_amount zero', () => {
    const result = goalSchema.safeParse({ ...validData, current_amount: 0 })
    expect(result.success).toBe(true)
  })

  it('aceita deadline opcional', () => {
    const result = goalSchema.safeParse({ ...validData, deadline: '2026-12-31' })
    expect(result.success).toBe(true)
  })
})
