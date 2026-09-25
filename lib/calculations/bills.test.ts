import { describe, it, expect } from 'vitest'
import { computeBillStatus, billAppliesInMonth } from '@/lib/calculations/bills'

describe('billAppliesInMonth', () => {
  it('não aplica antes do mês de início', () => {
    expect(billAppliesInMonth(5, 2026, 'MONTHLY', 4, 2026)).toBe(false)
    expect(billAppliesInMonth(5, 2026, 'MONTHLY', 12, 2025)).toBe(false)
  })

  it('MONTHLY aplica todo mês a partir do início', () => {
    expect(billAppliesInMonth(5, 2026, 'MONTHLY', 5, 2026)).toBe(true)
    expect(billAppliesInMonth(5, 2026, 'MONTHLY', 8, 2026)).toBe(true)
    expect(billAppliesInMonth(5, 2026, 'MONTHLY', 3, 2027)).toBe(true)
  })

  it('BIMONTHLY aplica a cada 2 meses', () => {
    expect(billAppliesInMonth(1, 2026, 'BIMONTHLY', 1, 2026)).toBe(true)
    expect(billAppliesInMonth(1, 2026, 'BIMONTHLY', 2, 2026)).toBe(false)
    expect(billAppliesInMonth(1, 2026, 'BIMONTHLY', 3, 2026)).toBe(true)
  })

  it('QUARTERLY aplica a cada 3 meses', () => {
    expect(billAppliesInMonth(1, 2026, 'QUARTERLY', 1, 2026)).toBe(true)
    expect(billAppliesInMonth(1, 2026, 'QUARTERLY', 2, 2026)).toBe(false)
    expect(billAppliesInMonth(1, 2026, 'QUARTERLY', 4, 2026)).toBe(true)
  })

  it('SEMIANNUAL aplica a cada 6 meses', () => {
    expect(billAppliesInMonth(1, 2026, 'SEMIANNUAL', 1, 2026)).toBe(true)
    expect(billAppliesInMonth(1, 2026, 'SEMIANNUAL', 7, 2026)).toBe(true)
    expect(billAppliesInMonth(1, 2026, 'SEMIANNUAL', 6, 2026)).toBe(false)
  })

  it('ANNUAL aplica somente no mesmo mês de anos seguintes', () => {
    expect(billAppliesInMonth(3, 2026, 'ANNUAL', 3, 2026)).toBe(true)
    expect(billAppliesInMonth(3, 2026, 'ANNUAL', 3, 2027)).toBe(true)
    expect(billAppliesInMonth(3, 2026, 'ANNUAL', 4, 2027)).toBe(false)
  })

  it('recorrência desconhecida é tratada como mensal', () => {
    expect(billAppliesInMonth(1, 2026, 'ONCE', 5, 2026)).toBe(true)
  })
})

describe('computeBillStatus', () => {
  const today = new Date(2026, 0, 15)

  it('respeita status PAID salvo', () => {
    expect(computeBillStatus(10, 1, 2026, 'PAID', today)).toBe('PAID')
  })

  it('trata SKIPPED como PENDING', () => {
    expect(computeBillStatus(10, 1, 2026, 'SKIPPED', today)).toBe('PENDING')
  })

  it('mês/ano anterior é OVERDUE', () => {
    expect(computeBillStatus(10, 12, 2025, null, today)).toBe('OVERDUE')
    expect(computeBillStatus(10, 11, 2025, null, today)).toBe('OVERDUE')
  })

  it('dia já passado no mês atual é OVERDUE', () => {
    expect(computeBillStatus(10, 1, 2026, null, today)).toBe('OVERDUE')
  })

  it('dia ainda por vir no mês atual é PENDING', () => {
    expect(computeBillStatus(20, 1, 2026, null, today)).toBe('PENDING')
  })

  it('mês futuro é PENDING', () => {
    expect(computeBillStatus(10, 3, 2026, null, today)).toBe('PENDING')
  })

  it('faz clamp de due_day maior que os dias do mês', () => {
    expect(computeBillStatus(31, 2, 2026, null, new Date(2026, 1, 15))).toBe('PENDING')
    expect(computeBillStatus(31, 4, 2026, null, new Date(2026, 3, 15))).toBe('PENDING')
  })
})
