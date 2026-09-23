import { describe, it, expect } from 'vitest'
import { computeAccountBalance, sumAccountBalances } from '@/lib/calculations/accounts'

describe('computeAccountBalance', () => {
  it('retorna saldo inicial quando não há movimentações', () => {
    const result = computeAccountBalance(1000, [])
    expect(result.balance).toBe(1000)
    expect(result.income).toBe(0)
    expect(result.expenses).toBe(0)
  })

  it('soma receitas e subtrai despesas', () => {
    const result = computeAccountBalance(1000, [
      { type: 'INCOME', amount: 3000 },
      { type: 'EXPENSE', amount: 2500 },
    ])
    expect(result.income).toBe(3000)
    expect(result.expenses).toBe(2500)
    expect(result.balance).toBe(1500)
  })

  it('considera transferências recebidas e enviadas', () => {
    const result = computeAccountBalance(
      500,
      [],
      [{ amount: 200 }],
      [{ amount: 50 }]
    )
    expect(result.transfersIn).toBe(200)
    expect(result.transfersOut).toBe(50)
    expect(result.balance).toBe(650)
  })

  it('acumula saldo de um mês para o outro', () => {
    const month1 = computeAccountBalance(1000, [
      { type: 'INCOME', amount: 3000 },
      { type: 'EXPENSE', amount: 2500 },
    ])
    const month2 = computeAccountBalance(month1.balance, [
      { type: 'INCOME', amount: 3000 },
      { type: 'EXPENSE', amount: 2000 },
    ])
    expect(month1.balance).toBe(1500)
    expect(month2.balance).toBe(2500)
  })

  it('permite saldo negativo', () => {
    const result = computeAccountBalance(100, [{ type: 'EXPENSE', amount: 350 }])
    expect(result.balance).toBe(-250)
  })

  it('arredonda para duas casas decimais', () => {
    const result = computeAccountBalance(0.1, [
      { type: 'INCOME', amount: 0.2 },
    ])
    expect(result.balance).toBe(0.3)
  })
})

describe('sumAccountBalances', () => {
  it('soma o saldo de todas as contas', () => {
    expect(sumAccountBalances([{ balance: 100 }, { balance: 250.5 }, { balance: -30 }])).toBe(
      320.5
    )
  })

  it('retorna zero para lista vazia', () => {
    expect(sumAccountBalances([])).toBe(0)
  })
})
