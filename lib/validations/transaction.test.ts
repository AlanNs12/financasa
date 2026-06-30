import { describe, it, expect } from 'vitest'
import { transactionSchema } from '@/lib/validations/transaction'

describe('transactionSchema', () => {
  const validData = {
    type: 'EXPENSE',
    amount: 100,
    description: 'Mercado',
    date: '2026-06-15',
    category_id: 'cat-1',
    payment_method: 'PIX',
  }

  it('aceita input válido', () => {
    const result = transactionSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita tipo inválido', () => {
    const result = transactionSchema.safeParse({ ...validData, type: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('rejeita valor zero', () => {
    const result = transactionSchema.safeParse({ ...validData, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita valor negativo', () => {
    const result = transactionSchema.safeParse({ ...validData, amount: -50 })
    expect(result.success).toBe(false)
  })

  it('rejeita descrição vazia', () => {
    const result = transactionSchema.safeParse({ ...validData, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita data vazia', () => {
    const result = transactionSchema.safeParse({ ...validData, date: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita category_id vazio', () => {
    const result = transactionSchema.safeParse({ ...validData, category_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita payment_method inválido', () => {
    const result = transactionSchema.safeParse({ ...validData, payment_method: 'PAYPAL' })
    expect(result.success).toBe(false)
  })

  it('aceita credit_card_id opcional', () => {
    const result = transactionSchema.safeParse({ ...validData, credit_card_id: 'card-1' })
    expect(result.success).toBe(true)
  })

  it('aceita credit_card_id nulo', () => {
    const result = transactionSchema.safeParse({ ...validData, credit_card_id: null })
    expect(result.success).toBe(true)
  })
})
