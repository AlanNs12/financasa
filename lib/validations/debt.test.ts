import { describe, it, expect } from 'vitest'
import { debtSchema } from '@/lib/validations/debt'

describe('debtSchema', () => {
  const validData = {
    institution: 'Banco do Brasil',
    product: 'Empréstimo pessoal',
    classification: 'EMPRESTIMO_PESSOAL',
    principal_amount: 10000,
    started_at: '2026-01-01',
    interest_rate: 12.5,
    installment_amount: 500,
    installment_total: 24,
  }

  it('aceita input válido', () => {
    const result = debtSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita instituição vazia', () => {
    const result = debtSchema.safeParse({ ...validData, institution: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita produto vazio', () => {
    const result = debtSchema.safeParse({ ...validData, product: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita classification inválida', () => {
    const result = debtSchema.safeParse({ ...validData, classification: 'CHEQUE_ESPECIAL' })
    expect(result.success).toBe(false)
  })

  it('rejeita principal_amount zero', () => {
    const result = debtSchema.safeParse({ ...validData, principal_amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita principal_amount negativo', () => {
    const result = debtSchema.safeParse({ ...validData, principal_amount: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita interest_rate negativa', () => {
    const result = debtSchema.safeParse({ ...validData, interest_rate: -1 })
    expect(result.success).toBe(false)
  })

  it('aceita interest_rate zero', () => {
    const result = debtSchema.safeParse({ ...validData, interest_rate: 0 })
    expect(result.success).toBe(true)
  })

  it('rejeita installment_amount zero', () => {
    const result = debtSchema.safeParse({ ...validData, installment_amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita installment_total zero', () => {
    const result = debtSchema.safeParse({ ...validData, installment_total: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita installment_total não-inteiro', () => {
    const result = debtSchema.safeParse({ ...validData, installment_total: 2.5 })
    expect(result.success).toBe(false)
  })

  it('rejeita started_at vazio', () => {
    const result = debtSchema.safeParse({ ...validData, started_at: '' })
    expect(result.success).toBe(false)
  })

  it('aceita down_payment opcional', () => {
    const result = debtSchema.safeParse({ ...validData, down_payment: 500 })
    expect(result.success).toBe(true)
  })

  it('rejeita down_payment negativo', () => {
    const result = debtSchema.safeParse({ ...validData, down_payment: -100 })
    expect(result.success).toBe(false)
  })

  it('aceita cet_rate opcional', () => {
    const result = debtSchema.safeParse({ ...validData, cet_rate: 18.3 })
    expect(result.success).toBe(true)
  })
})
