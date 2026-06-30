import { describe, it, expect } from 'vitest'
import { budgetSchema } from '@/lib/validations/budget'

describe('budgetSchema', () => {
  const validData = {
    month: 6,
    year: 2026,
    total_income: 5000,
    items: [
      { category_id: 'cat-1', planned: 1000 },
      { category_id: 'cat-2', planned: 500 },
    ],
  }

  it('aceita input válido', () => {
    const result = budgetSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejeita month menor que 1', () => {
    const result = budgetSchema.safeParse({ ...validData, month: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita month maior que 12', () => {
    const result = budgetSchema.safeParse({ ...validData, month: 13 })
    expect(result.success).toBe(false)
  })

  it('rejeita year menor que 2020', () => {
    const result = budgetSchema.safeParse({ ...validData, year: 2019 })
    expect(result.success).toBe(false)
  })

  it('rejeita year maior que 2100', () => {
    const result = budgetSchema.safeParse({ ...validData, year: 2101 })
    expect(result.success).toBe(false)
  })

  it('rejeita total_income negativo', () => {
    const result = budgetSchema.safeParse({ ...validData, total_income: -1 })
    expect(result.success).toBe(false)
  })

  it('aceita total_income zero', () => {
    const result = budgetSchema.safeParse({ ...validData, total_income: 0 })
    expect(result.success).toBe(true)
  })

  it('rejeita planned negativo nos items', () => {
    const result = budgetSchema.safeParse({
      ...validData,
      items: [{ category_id: 'cat-1', planned: -100 }],
    })
    expect(result.success).toBe(false)
  })

  it('aceita items vazios', () => {
    const result = budgetSchema.safeParse({ ...validData, items: [] })
    expect(result.success).toBe(true)
  })
})
