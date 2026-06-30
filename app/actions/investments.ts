'use server'

import { revalidatePath } from 'next/cache'
import {
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '@/lib/db/queries/investments'
import { investmentSchema } from '@/lib/validations/investment'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import type { InvestmentType } from '@/types'

export async function createInvestmentAction(data: {
  name: string
  asset_type: string
  goal_id?: string | null
  rate_description?: string
  applied_at: string
  maturity_at?: string | null
  gross_invested: number
  gross_current: number
  net_current: number
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = investmentSchema.safeParse({
    name: data.name,
    asset_type: data.asset_type,
    goal_id: data.goal_id || undefined,
    rate_description: data.rate_description,
    applied_at: data.applied_at,
    maturity_at: data.maturity_at || undefined,
    gross_invested: String(data.gross_invested),
    gross_current: String(data.gross_current),
    net_current: String(data.net_current),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createInvestment({
    household_id: current.householdId,
    user_id: current.userId,
    name: parsed.data.name,
    asset_type: parsed.data.asset_type as InvestmentType,
    goal_id: parsed.data.goal_id || undefined,
    rate_description: parsed.data.rate_description,
    applied_at: new Date(parsed.data.applied_at + 'T12:00:00'),
    maturity_at: parsed.data.maturity_at
      ? new Date(parsed.data.maturity_at + 'T12:00:00')
      : undefined,
    gross_invested: parsed.data.gross_invested,
    gross_current: parsed.data.gross_current,
    net_current: parsed.data.net_current,
  })

  revalidatePath('/investimentos')
  return { success: true }
}

export async function updateInvestmentAction(
  id: string,
  data: {
    name?: string
    asset_type?: string
    goal_id?: string | null
    rate_description?: string
    applied_at?: string
    maturity_at?: string | null
    gross_invested?: number
    gross_current?: number
    net_current?: number
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = investmentSchema.safeParse({
    name: data.name ?? '',
    asset_type: data.asset_type ?? 'OUTROS',
    goal_id: data.goal_id ?? undefined,
    rate_description: data.rate_description,
    applied_at: data.applied_at ?? new Date().toISOString().split('T')[0],
    maturity_at: data.maturity_at ?? undefined,
    gross_invested: String(data.gross_invested ?? 0),
    gross_current: String(data.gross_current ?? 0),
    net_current: String(data.net_current ?? 0),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateInvestment(id, current.householdId, {
    name: parsed.data.name,
    asset_type: parsed.data.asset_type as InvestmentType,
    goal_id: parsed.data.goal_id || null,
    rate_description: parsed.data.rate_description ?? null,
    applied_at: new Date(parsed.data.applied_at + 'T12:00:00'),
    maturity_at: parsed.data.maturity_at
      ? new Date(parsed.data.maturity_at + 'T12:00:00')
      : null,
    gross_invested: parsed.data.gross_invested,
    gross_current: parsed.data.gross_current,
    net_current: parsed.data.net_current,
  })

  revalidatePath('/investimentos')
  return { success: true }
}

export async function deleteInvestmentAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteInvestment(id, current.householdId)

  if (count === 0) {
    return { error: 'Investimento não encontrado.' }
  }

  revalidatePath('/investimentos')
  return { success: true }
}
