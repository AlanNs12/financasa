import { describe, it, expect } from 'vitest'
import { recurringBillSchema } from '@/lib/validations/bill'

describe('recurringBillSchema', () => {
  const validData = {
    name: 'Aluguel',
    amount: 1200,
    due_day: 10,
    recurrence: 'MONTHLY',
    bill_type: 'fixa',
  }

  it('aceita input válido', () => {
    const result = recurringBillSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = recurringBillSchema.safeParse({ ...validData, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita amount zero', () => {
    const result = recurringBillSchema.safeParse({ ...validData, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita amount negativo', () => {
    const result = recurringBillSchema.safeParse({ ...validData, amount: -10 })
    expect(result.success).toBe(false)
  })

  it('rejeita due_day menor que 1', () => {
    const result = recurringBillSchema.safeParse({ ...validData, due_day: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita due_day maior que 31', () => {
    const result = recurringBillSchema.safeParse({ ...validData, due_day: 32 })
    expect(result.success).toBe(false)
  })

  it('rejeita recurrence inválida', () => {
    const result = recurringBillSchema.safeParse({ ...validData, recurrence: 'WEEKLY' })
    expect(result.success).toBe(false)
  })

  it('rejeita bill_type parcelada sem installment_total', () => {
    const result = recurringBillSchema.safeParse({
      ...validData,
      bill_type: 'parcelada',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita bill_type parcelada com installment_total menor que 2', () => {
    const result = recurringBillSchema.safeParse({
      ...validData,
      bill_type: 'parcelada',
      installment_total: 1,
    })
    expect(result.success).toBe(false)
  })

  it('aceita bill_type parcelada com installment_total válido', () => {
    const result = recurringBillSchema.safeParse({
      ...validData,
      bill_type: 'parcelada',
      installment_total: 12,
    })
    expect(result.success).toBe(true)
  })
})
