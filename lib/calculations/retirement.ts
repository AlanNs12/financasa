export interface CompoundGrowthPoint {
  month: number
  value: number
  contributed: number
  earnings: number
}

export interface CompoundGrowthInput {
  initialValue: number
  monthlyContribution: number
  annualRate: number
  months: number
}

export function calculateCompoundGrowth({
  initialValue,
  monthlyContribution,
  annualRate,
  months,
}: CompoundGrowthInput): CompoundGrowthPoint[] {
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1
  const points: CompoundGrowthPoint[] = []

  let value = initialValue
  let contributed = initialValue

  points.push({ month: 0, value, contributed, earnings: 0 })

  for (let m = 1; m <= months; m++) {
    value = value * (1 + monthlyRate) + monthlyContribution
    contributed += monthlyContribution
    points.push({
      month: m,
      value,
      contributed,
      earnings: value - contributed,
    })
  }

  return points
}

interface RegressiveTaxBracket {
  maxMonths: number
  rate: number
}

const REGRESSIVE_BRACKETS: RegressiveTaxBracket[] = [
  { maxMonths: 15, rate: 0.35 },
  { maxMonths: 24, rate: 0.3 },
  { maxMonths: 36, rate: 0.25 },
  { maxMonths: 48, rate: 0.2 },
  { maxMonths: 60, rate: 0.15 },
  { maxMonths: Infinity, rate: 0.1 },
]

export function getRegressiveRate(months: number): number {
  for (const bracket of REGRESSIVE_BRACKETS) {
    if (months <= bracket.maxMonths) {
      return bracket.rate
    }
  }
  return 0.1
}

export function applyRegressiveTax(baseAmount: number, months: number): number {
  const rate = getRegressiveRate(months)
  return baseAmount * rate
}

export type ProductType = 'VGBL' | 'PGBL' | 'OUTROS'

export interface NetResult {
  productType: ProductType
  grossValue: number
  totalContributed: number
  totalEarnings: number
  taxAmount: number
  netValue: number
}

export function calculateNetResult(
  grossValue: number,
  totalContributed: number,
  months: number,
  productType: ProductType
): NetResult {
  const totalEarnings = grossValue - totalContributed

  let taxAmount: number

  if (productType === 'PGBL') {
    taxAmount = applyRegressiveTax(grossValue, months)
  } else if (productType === 'VGBL') {
    taxAmount = applyRegressiveTax(totalEarnings, months)
  } else {
    taxAmount = totalEarnings * 0.15
  }

  const netValue = grossValue - taxAmount

  return {
    productType,
    grossValue,
    totalContributed,
    totalEarnings,
    taxAmount,
    netValue,
  }
}

export interface SimulationResult {
  points: CompoundGrowthPoint[]
  grossValue: number
  totalContributed: number
  totalEarnings: number
  netResults: NetResult[]
}

export function runSimulation(input: CompoundGrowthInput): SimulationResult {
  const points = calculateCompoundGrowth(input)
  const finalPoint = points[points.length - 1]
  const grossValue = finalPoint.value
  const totalContributed = finalPoint.contributed
  const totalEarnings = finalPoint.earnings

  const productTypes: ProductType[] = ['VGBL', 'PGBL', 'OUTROS']
  const netResults = productTypes.map((pt) =>
    calculateNetResult(grossValue, totalContributed, input.months, pt)
  )

  return {
    points,
    grossValue,
    totalContributed,
    totalEarnings,
    netResults,
  }
}
