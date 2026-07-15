import { describe, it, expect } from 'vitest'
import { calculateBillingPeriod, calculateInstallmentPlan } from './billing'

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

describe('calculateInstallmentPlan', () => {

  it('3x à vista (antes do fechamento) começa no mês atual', () => {
    const date = new Date(2026, 6, 10)
    const plan = calculateInstallmentPlan(date, 15, 1500, 3)
    expect(plan[0]).toMatchObject({ installmentNumber: 1, billingMonth: 7, billingYear: 2026 })
    expect(plan[1]).toMatchObject({ installmentNumber: 2, billingMonth: 8, billingYear: 2026 })
    expect(plan[2]).toMatchObject({ installmentNumber: 3, billingMonth: 9, billingYear: 2026 })
  })

  it('2x após o fechamento começa no mês seguinte', () => {
    const date = new Date(2026, 6, 20)
    const plan = calculateInstallmentPlan(date, 15, 1000, 2)
    expect(plan[0]).toMatchObject({ billingMonth: 8, billingYear: 2026 })
    expect(plan[1]).toMatchObject({ billingMonth: 9, billingYear: 2026 })
  })

  it('virada de ano: 3x em novembro (antes do fechamento dia 20)', () => {
    const date = new Date(2026, 10, 10)
    const plan = calculateInstallmentPlan(date, 20, 300, 3)
    expect(plan[0]).toMatchObject({ billingMonth: 11, billingYear: 2026 })
    expect(plan[1]).toMatchObject({ billingMonth: 12, billingYear: 2026 })
    expect(plan[2]).toMatchObject({ billingMonth: 1, billingYear: 2027 })
  })

  it('soma das parcelas = total exato', () => {
    const date = new Date(2026, 6, 10)
    const plan = calculateInstallmentPlan(date, 15, 1499.99, 3)
    const sum = plan.reduce((s, p) => s + p.amount, 0)
    expect(Math.round(sum * 100)).toBe(Math.round(1499.99 * 100))
  })

  it('à vista (1 parcela) = mesma lógica de billing normal', () => {
    const date = new Date(2026, 6, 20)
    const plan = calculateInstallmentPlan(date, 15, 500, 1)
    expect(plan[0]).toMatchObject({ billingMonth: 8, billingYear: 2026, amount: 500 })
  })
})
