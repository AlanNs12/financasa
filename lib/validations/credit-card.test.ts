import { describe, it, expect } from 'vitest'
import { creditCardSchema } from '@/lib/validations/credit-card'

describe('creditCardSchema', () => {
  const validData = {
    name: 'Nubank',
  }

  it('aceita input válido mínimo', () => {
    const result = creditCardSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = creditCardSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita spending_cap negativo', () => {
    const result = creditCardSchema.safeParse({ ...validData, spending_cap: -100 })
    expect(result.success).toBe(false)
  })

  it('aceita spending_cap zero', () => {
    const result = creditCardSchema.safeParse({ ...validData, spending_cap: 0 })
    expect(result.success).toBe(true)
  })

  it('rejeita closing_day menor que 1', () => {
    const result = creditCardSchema.safeParse({ ...validData, closing_day: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita closing_day maior que 31', () => {
    const result = creditCardSchema.safeParse({ ...validData, closing_day: 32 })
    expect(result.success).toBe(false)
  })

  it('rejeita due_day menor que 1', () => {
    const result = creditCardSchema.safeParse({ ...validData, due_day: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita due_day maior que 31', () => {
    const result = creditCardSchema.safeParse({ ...validData, due_day: 32 })
    expect(result.success).toBe(false)
  })

  it('aceita closing_day e due_day válidos', () => {
    const result = creditCardSchema.safeParse({
      ...validData,
      closing_day: 28,
      due_day: 5,
    })
    expect(result.success).toBe(true)
  })
})
