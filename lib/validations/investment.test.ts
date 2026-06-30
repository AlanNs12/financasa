import { describe, it, expect } from 'vitest'
import { investmentSchema } from '@/lib/validations/investment'

describe('investmentSchema', () => {
  const validData = {
    name: 'Tesouro Selic',
    asset_type: 'RENDA_FIXA',
    applied_at: '2026-01-15',
    gross_invested: 1000,
    gross_current: 1100,
    net_current: 1050,
  }

  it('aceita input válido', () => {
    const result = investmentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = investmentSchema.safeParse({ ...validData, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita asset_type inválido', () => {
    const result = investmentSchema.safeParse({ ...validData, asset_type: 'CDB' })
    expect(result.success).toBe(false)
  })

  it('rejeita gross_invested negativo', () => {
    const result = investmentSchema.safeParse({ ...validData, gross_invested: -100 })
    expect(result.success).toBe(false)
  })

  it('aceita gross_invested zero', () => {
    const result = investmentSchema.safeParse({ ...validData, gross_invested: 0 })
    expect(result.success).toBe(true)
  })

  it('rejeita gross_current negativo', () => {
    const result = investmentSchema.safeParse({ ...validData, gross_current: -50 })
    expect(result.success).toBe(false)
  })

  it('rejeita net_current negativo', () => {
    const result = investmentSchema.safeParse({ ...validData, net_current: -10 })
    expect(result.success).toBe(false)
  })

  it('rejeita applied_at vazio', () => {
    const result = investmentSchema.safeParse({ ...validData, applied_at: '' })
    expect(result.success).toBe(false)
  })

  it('aceita goal_id opcional', () => {
    const result = investmentSchema.safeParse({ ...validData, goal_id: 'goal-1' })
    expect(result.success).toBe(true)
  })

  it('aceita maturity_at opcional nulo', () => {
    const result = investmentSchema.safeParse({ ...validData, maturity_at: null })
    expect(result.success).toBe(true)
  })
})
