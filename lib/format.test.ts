import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  getMonthName,
  getMonthAbbr,
} from '@/lib/format'

describe('formatCurrency', () => {
  it('formata valor positivo', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toMatch(/R\$/)
  })

  it('formata valor zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
  })

  it('formata valor negativo', () => {
    const result = formatCurrency(-500.5)
    expect(result).toContain('500,50')
    expect(result).toContain('-')
  })

  it('formata grande número com separadores de milhar', () => {
    const result = formatCurrency(1234567.89)
    expect(result).toContain('1.234.567,89')
  })
})

describe('formatPercentage', () => {
  it('arredonda para inteiro', () => {
    expect(formatPercentage(42.6)).toBe('43%')
    expect(formatPercentage(42.4)).toBe('42%')
  })

  it('formata zero', () => {
    expect(formatPercentage(0)).toBe('0%')
  })

  it('formata valor negativo', () => {
    expect(formatPercentage(-15.7)).toBe('-16%')
  })

  it('formata cem por cento', () => {
    expect(formatPercentage(100)).toBe('100%')
  })
})

describe('getMonthName', () => {
  it('retorna os 12 meses por extenso', () => {
    expect(getMonthName(1)).toBe('Janeiro')
    expect(getMonthName(2)).toBe('Fevereiro')
    expect(getMonthName(3)).toBe('Março')
    expect(getMonthName(4)).toBe('Abril')
    expect(getMonthName(5)).toBe('Maio')
    expect(getMonthName(6)).toBe('Junho')
    expect(getMonthName(7)).toBe('Julho')
    expect(getMonthName(8)).toBe('Agosto')
    expect(getMonthName(9)).toBe('Setembro')
    expect(getMonthName(10)).toBe('Outubro')
    expect(getMonthName(11)).toBe('Novembro')
    expect(getMonthName(12)).toBe('Dezembro')
  })

  it('retorna string vazia para mês inválido', () => {
    expect(getMonthName(0)).toBe('')
    expect(getMonthName(13)).toBe('')
  })
})

describe('getMonthAbbr', () => {
  it('retorna as 12 abreviações', () => {
    expect(getMonthAbbr(1)).toBe('JAN')
    expect(getMonthAbbr(2)).toBe('FEV')
    expect(getMonthAbbr(3)).toBe('MAR')
    expect(getMonthAbbr(4)).toBe('ABR')
    expect(getMonthAbbr(5)).toBe('MAI')
    expect(getMonthAbbr(6)).toBe('JUN')
    expect(getMonthAbbr(7)).toBe('JUL')
    expect(getMonthAbbr(8)).toBe('AGO')
    expect(getMonthAbbr(9)).toBe('SET')
    expect(getMonthAbbr(10)).toBe('OUT')
    expect(getMonthAbbr(11)).toBe('NOV')
    expect(getMonthAbbr(12)).toBe('DEZ')
  })

  it('retorna string vazia para mês inválido', () => {
    expect(getMonthAbbr(0)).toBe('')
    expect(getMonthAbbr(13)).toBe('')
  })
})
