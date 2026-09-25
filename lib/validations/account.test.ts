import { describe, it, expect } from 'vitest'
import { accountSchema, transferSchema } from '@/lib/validations/account'

describe('accountSchema', () => {
  it('aceita input válido mínimo', () => {
    const result = accountSchema.safeParse({ name: 'Nubank' })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = accountSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('usa CHECKING como tipo padrão', () => {
    const result = accountSchema.safeParse({ name: 'Conta' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.type).toBe('CHECKING')
  })

  it('converte saldo inicial para número', () => {
    const result = accountSchema.safeParse({ name: 'Conta', initial_balance: '1500.50' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.initial_balance).toBe(1500.5)
  })

  it('assume saldo inicial zero quando ausente', () => {
    const result = accountSchema.safeParse({ name: 'Conta' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.initial_balance).toBe(0)
  })

  it('rejeita tipo inválido', () => {
    const result = accountSchema.safeParse({ name: 'Conta', type: 'CRYPTO' })
    expect(result.success).toBe(false)
  })
})

describe('transferSchema', () => {
  const valid = {
    from_account_id: 'acc-1',
    to_account_id: 'acc-2',
    amount: 100,
    date: '2026-01-10',
  }

  it('aceita transferência válida', () => {
    const result = transferSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejeita valor zero ou negativo', () => {
    expect(transferSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(transferSchema.safeParse({ ...valid, amount: -10 }).success).toBe(false)
  })

  it('rejeita origem igual ao destino', () => {
    const result = transferSchema.safeParse({ ...valid, to_account_id: 'acc-1' })
    expect(result.success).toBe(false)
  })

  it('rejeita ausência de conta de origem', () => {
    const result = transferSchema.safeParse({ ...valid, from_account_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita ausência de data', () => {
    const result = transferSchema.safeParse({ ...valid, date: '' })
    expect(result.success).toBe(false)
  })
})
