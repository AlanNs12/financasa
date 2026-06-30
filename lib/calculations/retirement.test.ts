import { describe, it, expect } from 'vitest'
import {
  calculateCompoundGrowth,
  getRegressiveRate,
  applyRegressiveTax,
  calculateNetResult,
  runSimulation,
} from '@/lib/calculations/retirement'

describe('calculateCompoundGrowth', () => {
  it('capitaliza apenas o valor inicial quando aporte mensal é zero', () => {
    const points = calculateCompoundGrowth({
      initialValue: 1000,
      monthlyContribution: 0,
      annualRate: 12,
      months: 12,
    })

    expect(points[0].value).toBe(1000)
    expect(points[0].contributed).toBe(1000)
    expect(points[0].earnings).toBe(0)

    const finalPoint = points[12]
    expect(finalPoint.contributed).toBe(1000)
    expect(finalPoint.value).toBeGreaterThan(1000)
    expect(finalPoint.earnings).toBe(finalPoint.value - 1000)
  })

  it('soma apenas aportes linearmente quando taxa é zero', () => {
    const points = calculateCompoundGrowth({
      initialValue: 500,
      monthlyContribution: 100,
      annualRate: 0,
      months: 6,
    })

    const finalPoint = points[6]
    expect(finalPoint.value).toBe(500 + 100 * 6)
    expect(finalPoint.contributed).toBe(500 + 100 * 6)
    expect(finalPoint.earnings).toBe(0)
  })

  it('retorna apenas o ponto inicial quando months é zero', () => {
    const points = calculateCompoundGrowth({
      initialValue: 2000,
      monthlyContribution: 50,
      annualRate: 10,
      months: 0,
    })

    expect(points).toHaveLength(1)
    expect(points[0].month).toBe(0)
    expect(points[0].value).toBe(2000)
  })

  it('valor final cresce com taxa positiva e aporte positivo', () => {
    const points = calculateCompoundGrowth({
      initialValue: 1000,
      monthlyContribution: 550,
      annualRate: 9.5,
      months: 420,
    })

    const finalPoint = points[420]
    expect(finalPoint.value).toBeGreaterThan(finalPoint.contributed)
    expect(finalPoint.earnings).toBeGreaterThan(0)
  })

  it('tem points.length === months + 1', () => {
    const points = calculateCompoundGrowth({
      initialValue: 100,
      monthlyContribution: 50,
      annualRate: 8,
      months: 24,
    })

    expect(points).toHaveLength(25)
  })
})

describe('getRegressiveRate', () => {
  it('retorna 35% para 15 meses ou menos', () => {
    expect(getRegressiveRate(1)).toBe(0.35)
    expect(getRegressiveRate(15)).toBe(0.35)
  })

  it('retorna 30% para 16-24 meses', () => {
    expect(getRegressiveRate(16)).toBe(0.3)
    expect(getRegressiveRate(24)).toBe(0.3)
  })

  it('retorna 25% para 25-36 meses', () => {
    expect(getRegressiveRate(25)).toBe(0.25)
    expect(getRegressiveRate(36)).toBe(0.25)
  })

  it('retorna 20% para 37-48 meses', () => {
    expect(getRegressiveRate(37)).toBe(0.2)
    expect(getRegressiveRate(48)).toBe(0.2)
  })

  it('retorna 15% para 49-60 meses', () => {
    expect(getRegressiveRate(49)).toBe(0.15)
    expect(getRegressiveRate(60)).toBe(0.15)
  })

  it('retorna 10% para mais de 60 meses', () => {
    expect(getRegressiveRate(61)).toBe(0.1)
    expect(getRegressiveRate(420)).toBe(0.1)
  })
})

describe('applyRegressiveTax', () => {
  it('aplica a taxa correta da faixa sobre o valor base', () => {
    expect(applyRegressiveTax(1000, 10)).toBe(350)
    expect(applyRegressiveTax(1000, 20)).toBe(300)
    expect(applyRegressiveTax(1000, 30)).toBe(250)
    expect(applyRegressiveTax(1000, 40)).toBe(200)
    expect(applyRegressiveTax(1000, 50)).toBe(150)
    expect(applyRegressiveTax(1000, 100)).toBe(100)
  })

  it('retorna zero quando base é zero', () => {
    expect(applyRegressiveTax(0, 60)).toBe(0)
  })
})

describe('calculateNetResult', () => {
  it('VGBL tributa apenas os rendimentos', () => {
    const result = calculateNetResult(10000, 8000, 420, 'VGBL')
    expect(result.totalEarnings).toBe(2000)
    expect(result.taxAmount).toBe(200) // 10% sobre 2000
    expect(result.netValue).toBe(9800)
  })

  it('PGBL tributa o valor total resgatado', () => {
    const result = calculateNetResult(10000, 8000, 420, 'PGBL')
    expect(result.taxAmount).toBe(1000) // 10% sobre 10000
    expect(result.netValue).toBe(9000)
  })

  it('OUTROS aplica 15% fixo sobre rendimentos', () => {
    const result = calculateNetResult(10000, 8000, 420, 'OUTROS')
    expect(result.taxAmount).toBe(300) // 15% sobre 2000
    expect(result.netValue).toBe(9700)
  })

  it('VGBL e PGBL produzem valores líquidos diferentes', () => {
    const vgbl = calculateNetResult(10000, 8000, 420, 'VGBL')
    const pgbl = calculateNetResult(10000, 8000, 420, 'PGBL')
    expect(vgbl.netValue).not.toBe(pgbl.netValue)
    expect(pgbl.taxAmount).toBeGreaterThan(vgbl.taxAmount)
  })
})

describe('runSimulation', () => {
  it('retorna points, grossValue e 3 netResults', () => {
    const result = runSimulation({
      initialValue: 1000,
      monthlyContribution: 550,
      annualRate: 9.5,
      months: 120,
    })

    expect(result.points).toHaveLength(121)
    expect(result.grossValue).toBeGreaterThan(0)
    expect(result.netResults).toHaveLength(3)
    expect(result.netResults.map((r) => r.productType)).toEqual([
      'VGBL',
      'PGBL',
      'OUTROS',
    ])
  })
})
