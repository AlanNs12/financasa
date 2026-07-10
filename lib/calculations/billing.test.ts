import { describe, it, expect } from 'vitest'
import { calculateBillingPeriod } from './billing'

describe('calculateBillingPeriod', () => {

  it('compra no dia do fechamento → fatura do mês atual', () => {
    const date = new Date(2025, 6, 15)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra antes do fechamento → fatura do mês atual', () => {
    const date = new Date(2025, 6, 10)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra após o fechamento → fatura do próximo mês', () => {
    const date = new Date(2025, 6, 18)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 8, billingYear: 2025 })
  })

  it('compra em dezembro após fechamento → fatura de janeiro do ano seguinte', () => {
    const date = new Date(2025, 11, 25)
    expect(calculateBillingPeriod(date, 20))
      .toEqual({ billingMonth: 1, billingYear: 2026 })
  })

  it('compra em dezembro antes do fechamento → fatura de dezembro', () => {
    const date = new Date(2025, 11, 15)
    expect(calculateBillingPeriod(date, 20))
      .toEqual({ billingMonth: 12, billingYear: 2025 })
  })

  it('sem closing_day → fatura do mês da compra', () => {
    const date = new Date(2025, 6, 20)
    expect(calculateBillingPeriod(date, null))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('closing_day undefined → fatura do mês da compra', () => {
    const date = new Date(2025, 6, 20)
    expect(calculateBillingPeriod(date, undefined))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra no primeiro dia do mês, fechamento dia 5 → fatura do mês atual', () => {
    const date = new Date(2025, 6, 1)
    expect(calculateBillingPeriod(date, 5))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra no último dia do mês, fechamento dia 25 → próximo mês', () => {
    const date = new Date(2025, 6, 31)
    expect(calculateBillingPeriod(date, 25))
      .toEqual({ billingMonth: 8, billingYear: 2025 })
  })
})
