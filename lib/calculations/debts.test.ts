import { describe, it, expect } from 'vitest'
import {
  calculateDebtProgress,
  calculateDebtsSummary,
  calculateInstallmentPayoff,
} from '@/lib/calculations/debts'

describe('calculateDebtProgress', () => {
  it('calcula paid_amount como installment_amount * installment_paid', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 12,
      installment_paid: 3,
    })
    expect(result.paid_amount).toBe(1500)
  })

  it('calcula remaining_amount como total - pago', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 12,
      installment_paid: 3,
    })
    expect(result.remaining_amount).toBe(6000 - 1500)
  })

  it('calcula progress_pct como paid/total * 100', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 12,
      installment_paid: 3,
    })
    expect(result.progress_pct).toBeCloseTo(25, 1)
  })

  it('retorna 0% quando installment_total é zero', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 0,
      installment_paid: 0,
    })
    expect(result.progress_pct).toBe(0)
  })

  it('retorna 100% quando installment_paid === installment_total', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 10,
      installment_paid: 10,
    })
    expect(result.progress_pct).toBe(100)
    expect(result.remaining_amount).toBe(0)
  })

  it('retorna paid_amount zero quando installment_paid é zero', () => {
    const result = calculateDebtProgress({
      installment_amount: 500,
      installment_total: 12,
      installment_paid: 0,
    })
    expect(result.paid_amount).toBe(0)
    expect(result.remaining_amount).toBe(6000)
  })
})

describe('calculateDebtsSummary', () => {
  it('soma principal e pago corretamente', () => {
    const result = calculateDebtsSummary([
      { principal_amount: 10000, installment_amount: 500, installment_paid: 3 },
      { principal_amount: 5000, installment_amount: 250, installment_paid: 8 },
    ])
    expect(result.totalPrincipal).toBe(15000)
    expect(result.totalPaid).toBe(1500 + 2000)
    expect(result.totalRemaining).toBe(15000 - 3500)
  })

  it('retorna zeros para array vazio', () => {
    const result = calculateDebtsSummary([])
    expect(result.totalPrincipal).toBe(0)
    expect(result.totalPaid).toBe(0)
    expect(result.totalRemaining).toBe(0)
  })

  it('totalRemaining pode ser negativo se paid > principal', () => {
    const result = calculateDebtsSummary([
      { principal_amount: 1000, installment_amount: 500, installment_paid: 3 },
    ])
    expect(result.totalPaid).toBe(1500)
    expect(result.totalRemaining).toBe(1000 - 1500)
  })
})

describe('calculateInstallmentPayoff', () => {
  it('incrementa installment_paid em 1', () => {
    const result = calculateInstallmentPayoff(3, 12, false)
    expect(result.newPaid).toBe(4)
    expect(result.willSettle).toBe(false)
    expect(result.alreadySettled).toBe(false)
  })

  it('marca willSettle quando atinge o total', () => {
    const result = calculateInstallmentPayoff(11, 12, false)
    expect(result.newPaid).toBe(12)
    expect(result.willSettle).toBe(true)
    expect(result.alreadySettled).toBe(false)
  })

  it('marca willSettle quando excede o total', () => {
    const result = calculateInstallmentPayoff(12, 12, false)
    expect(result.newPaid).toBe(13)
    expect(result.willSettle).toBe(true)
  })

  it('retorna alreadySettled quando is_settled é true', () => {
    const result = calculateInstallmentPayoff(5, 12, true)
    expect(result.alreadySettled).toBe(true)
    expect(result.willSettle).toBe(true)
    expect(result.newPaid).toBe(5)
  })
})
