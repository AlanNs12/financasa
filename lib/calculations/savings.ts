export interface JarMovementLike {
  type: 'DEPOSIT' | 'WITHDRAW'
  amount: number
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function computeJarBalance(movements: JarMovementLike[]): number {
  const deposits = movements
    .filter((m) => m.type === 'DEPOSIT')
    .reduce((sum, m) => sum + m.amount, 0)

  const withdrawals = movements
    .filter((m) => m.type === 'WITHDRAW')
    .reduce((sum, m) => sum + m.amount, 0)

  return round2(deposits - withdrawals)
}

export function computeJarProgress(
  balance: number,
  targetAmount?: number | null
): number | null {
  if (targetAmount == null || targetAmount <= 0) return null
  return round2((balance / targetAmount) * 100)
}

export function computeAvailable(balance: number, reserved: number): number {
  return round2(balance - reserved)
}
