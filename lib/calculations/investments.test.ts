import { describe, it, expect } from 'vitest'
import {
  calculateInvestmentsSummary,
  calculateInvestmentGain,
} from '@/lib/calculations/investments'

describe('calculateInvestmentsSummary', () => {
  it('soma totais corretamente', () => {
    const result = calculateInvestmentsSummary([
      { gross_invested: 1000, gross_current: 1100, net_current: 1050, asset_type: 'RENDA_FIXA' },
      { gross_invested: 2000, gross_current: 2200, net_current: 2100, asset_type: 'RENDA_VARIAVEL' },
    ])
    expect(result.totalGrossInvested).toBe(3000)
    expect(result.totalGrossCurrent).toBe(3300)
    expect(result.totalNetCurrent).toBe(3150)
  })

  it('calcula profit e profitPercentage', () => {
    const result = calculateInvestmentsSummary([
      { gross_invested: 1000, gross_current: 1100, net_current: 1050, asset_type: 'RENDA_FIXA' },
    ])
    expect(result.profit).toBe(100)
    expect(result.profitPercentage).toBeCloseTo(10, 1)
  })

  it('profitPercentage é zero quando totalGrossInvested é zero', () => {
    const result = calculateInvestmentsSummary([
      { gross_invested: 0, gross_current: 100, net_current: 90, asset_type: 'CRIPTO' },
    ])
    expect(result.profitPercentage).toBe(0)
  })

  it('agrupa por asset_type com percentual da carteira', () => {
    const result = calculateInvestmentsSummary([
      { gross_invested: 1000, gross_current: 1100, net_current: 900, asset_type: 'RENDA_FIXA' },
      { gross_invested: 1000, gross_current: 1100, net_current: 300, asset_type: 'CRIPTO' },
    ])
    expect(result.totalNetCurrent).toBe(1200)
    expect(result.byAssetType).toHaveLength(2)
    expect(result.byAssetType[0].asset_type).toBe('RENDA_FIXA')
    expect(result.byAssetType[0].total).toBe(900)
    expect(result.byAssetType[0].percentage).toBe(75)
    expect(result.byAssetType[1].asset_type).toBe('CRIPTO')
    expect(result.byAssetType[1].percentage).toBe(25)
  })

  it('ordena byAssetType do maior para o menor', () => {
    const result = calculateInvestmentsSummary([
      { gross_invested: 100, gross_current: 100, net_current: 50, asset_type: 'CRIPTO' },
      { gross_invested: 100, gross_current: 100, net_current: 200, asset_type: 'RENDA_FIXA' },
      { gross_invested: 100, gross_current: 100, net_current: 100, asset_type: 'FUNDOS' },
    ])
    expect(result.byAssetType[0].total).toBe(200)
    expect(result.byAssetType[1].total).toBe(100)
    expect(result.byAssetType[2].total).toBe(50)
  })

  it('retorna valores zero para array vazio', () => {
    const result = calculateInvestmentsSummary([])
    expect(result.totalGrossInvested).toBe(0)
    expect(result.totalNetCurrent).toBe(0)
    expect(result.profit).toBe(0)
    expect(result.byAssetType).toEqual([])
  })
})

describe('calculateInvestmentGain', () => {
  it('calcula ganho positivo', () => {
    const result = calculateInvestmentGain({
      gross_invested: 1000,
      gross_current: 1200,
    })
    expect(result.gain).toBe(200)
    expect(result.gainPercentage).toBe(20)
    expect(result.isPositive).toBe(true)
  })

  it('calcula ganho negativo (perda)', () => {
    const result = calculateInvestmentGain({
      gross_invested: 1000,
      gross_current: 800,
    })
    expect(result.gain).toBe(-200)
    expect(result.gainPercentage).toBe(-20)
    expect(result.isPositive).toBe(false)
  })

  it('retorna ganho zero quando valores são iguais', () => {
    const result = calculateInvestmentGain({
      gross_invested: 1000,
      gross_current: 1000,
    })
    expect(result.gain).toBe(0)
    expect(result.gainPercentage).toBe(0)
    expect(result.isPositive).toBe(true)
  })

  it('gainPercentage é zero quando gross_invested é zero', () => {
    const result = calculateInvestmentGain({
      gross_invested: 0,
      gross_current: 100,
    })
    expect(result.gainPercentage).toBe(0)
  })
})
