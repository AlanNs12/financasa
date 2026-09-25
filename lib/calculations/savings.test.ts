import { describe, it, expect } from 'vitest'
import {
  computeJarBalance,
  computeJarProgress,
  computeAvailable,
} from '@/lib/calculations/savings'

describe('computeJarBalance', () => {
  it('retorna zero sem movimentos', () => {
    expect(computeJarBalance([])).toBe(0)
  })

  it('soma depósitos e subtrai resgates', () => {
    expect(
      computeJarBalance([
        { type: 'DEPOSIT', amount: 500 },
        { type: 'DEPOSIT', amount: 250.5 },
        { type: 'WITHDRAW', amount: 100 },
      ])
    ).toBe(650.5)
  })

  it('permite resultado zero', () => {
    expect(
      computeJarBalance([
        { type: 'DEPOSIT', amount: 300 },
        { type: 'WITHDRAW', amount: 300 },
      ])
    ).toBe(0)
  })
})

describe('computeJarProgress', () => {
  it('retorna null sem meta', () => {
    expect(computeJarProgress(100, null)).toBeNull()
    expect(computeJarProgress(100, undefined)).toBeNull()
  })

  it('retorna null com meta zero ou negativa', () => {
    expect(computeJarProgress(100, 0)).toBeNull()
    expect(computeJarProgress(100, -10)).toBeNull()
  })

  it('calcula percentual da meta', () => {
    expect(computeJarProgress(50, 200)).toBe(25)
    expect(computeJarProgress(200, 200)).toBe(100)
    expect(computeJarProgress(300, 200)).toBe(150)
  })
})

describe('computeAvailable', () => {
  it('desconta o valor guardado do saldo', () => {
    expect(computeAvailable(1000, 300)).toBe(700)
  })

  it('permite disponível negativo', () => {
    expect(computeAvailable(100, 300)).toBe(-200)
  })
})
