import type { InvestmentType } from '@/types'

export interface InvestmentSummaryInput {
  gross_invested: number
  gross_current: number
  net_current: number
  asset_type: InvestmentType
}

export interface InvestmentSummaryResult {
  totalGrossInvested: number
  totalNetCurrent: number
  totalGrossCurrent: number
  profit: number
  profitPercentage: number
  byAssetType: {
    asset_type: InvestmentType
    total: number
    percentage: number
  }[]
}

export function calculateInvestmentsSummary(
  investments: InvestmentSummaryInput[]
): InvestmentSummaryResult {
  const totalGrossInvested = investments.reduce(
    (sum, i) => sum + i.gross_invested,
    0
  )
  const totalGrossCurrent = investments.reduce(
    (sum, i) => sum + i.gross_current,
    0
  )
  const totalNetCurrent = investments.reduce(
    (sum, i) => sum + i.net_current,
    0
  )

  const byTypeMap = new Map<InvestmentType, number>()
  for (const inv of investments) {
    const current = byTypeMap.get(inv.asset_type) ?? 0
    byTypeMap.set(inv.asset_type, current + inv.net_current)
  }

  const byAssetType = Array.from(byTypeMap.entries())
    .map(([asset_type, total]) => ({
      asset_type,
      total,
      percentage: totalNetCurrent > 0 ? (total / totalNetCurrent) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  const profit = totalGrossCurrent - totalGrossInvested
  const profitPercentage =
    totalGrossInvested > 0 ? (profit / totalGrossInvested) * 100 : 0

  return {
    totalGrossInvested,
    totalNetCurrent,
    totalGrossCurrent,
    profit,
    profitPercentage,
    byAssetType,
  }
}

export interface InvestmentGainInput {
  gross_invested: number
  gross_current: number
}

export interface InvestmentGainResult {
  gain: number
  gainPercentage: number
  isPositive: boolean
}

export function calculateInvestmentGain(
  input: InvestmentGainInput
): InvestmentGainResult {
  const gain = input.gross_current - input.gross_invested
  const gainPercentage =
    input.gross_invested > 0 ? (gain / input.gross_invested) * 100 : 0

  return {
    gain,
    gainPercentage,
    isPositive: gain >= 0,
  }
}
