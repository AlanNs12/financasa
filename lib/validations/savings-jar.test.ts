import { describe, it, expect } from 'vitest'
import { savingsJarSchema, jarMovementSchema } from '@/lib/validations/savings-jar'

describe('savingsJarSchema', () => {
  it('aceita input válido mínimo', () => {
    const result = savingsJarSchema.safeParse({ name: 'Viagem', account_id: 'acc-1' })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    expect(savingsJarSchema.safeParse({ name: '', account_id: 'acc-1' }).success).toBe(false)
  })

  it('rejeita conta ausente', () => {
    expect(savingsJarSchema.safeParse({ name: 'Viagem', account_id: '' }).success).toBe(false)
  })

  it('rejeita meta negativa', () => {
    const result = savingsJarSchema.safeParse({
      name: 'Viagem',
      account_id: 'acc-1',
      target_amount: -10,
    })
    expect(result.success).toBe(false)
  })

  it('converte meta para número', () => {
    const result = savingsJarSchema.safeParse({
      name: 'Viagem',
      account_id: 'acc-1',
      target_amount: '1500',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.target_amount).toBe(1500)
  })
})

describe('jarMovementSchema', () => {
  const valid = { jar_id: 'jar-1', type: 'DEPOSIT' as const, amount: 100 }

  it('aceita movimento válido', () => {
    expect(jarMovementSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita valor zero ou negativo', () => {
    expect(jarMovementSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(jarMovementSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })

  it('rejeita tipo inválido', () => {
    expect(jarMovementSchema.safeParse({ ...valid, type: 'TRANSFER' }).success).toBe(false)
  })
})
