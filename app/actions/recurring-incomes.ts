'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import {
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
} from '@/lib/db/queries/recurring-incomes'
import { recurringIncomeSchema } from '@/lib/validations/recurring-income'
import type { Recurrence } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

export async function createRecurringIncomeAction(data: unknown) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = recurringIncomeSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos' }

  await createRecurringIncome({
    household_id: user.householdId,
    user_id: user.userId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    recurrence: parsed.data.recurrence as Recurrence,
    start_month: parsed.data.start_month,
    start_year: parsed.data.start_year,
  })

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}

export async function updateRecurringIncomeAction(id: string, data: unknown) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = recurringIncomeSchema.partial().safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos' }

  await updateRecurringIncome(id, user.householdId, {
    name: parsed.data.name ?? '',
    amount: parsed.data.amount ?? 0,
    recurrence: (parsed.data.recurrence ?? 'MONTHLY') as Recurrence,
  })

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  return { success: true }
}

export async function deleteRecurringIncomeAction(id: string) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  await deleteRecurringIncome(id, user.householdId)

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  return { success: true }
}

export async function confirmRecurringIncomeAction(
  recurringIncomeId: string,
  amount: number,
  date: string,
  month: number,
  year: number
) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const amountSchema = z.number().positive('Valor deve ser positivo')
  const parsed = amountSchema.safeParse(amount)
  if (!parsed.success) return { error: 'Valor inválido' }

  const income = await prisma.recurringIncome.findFirst({
    where: { id: recurringIncomeId, household_id: user.householdId },
  })
  if (!income) return { error: 'Receita não encontrada' }

  const existing = await prisma.transaction.findFirst({
    where: {
      household_id:        user.householdId,
      recurring_income_id: recurringIncomeId,
      type:                'INCOME',
      OR: [
        { billing_month: month, billing_year: year },
        {
          billing_month: null,
          date: {
            gte: new Date(year, month - 1, 1),
            lt:  new Date(year, month, 1),
          },
        },
      ],
    },
  })

  const categoryIncome = await prisma.category.findFirst({
    where: {
      household_id: user.householdId,
      type: 'INCOME',
    },
    select: { id: true },
  })
  if (!categoryIncome) return { error: 'Nenhuma categoria de receita encontrada' }

  if (existing) {
    await prisma.transaction.update({
      where: { id: existing.id },
      data: { amount: parsed.data },
    })
  } else {
    await prisma.transaction.create({
      data: {
        household_id:        user.householdId,
        user_id:             user.userId,
        category_id:         categoryIncome.id,
        type:                'INCOME',
        amount:              parsed.data,
        description:         income.name,
        date:                new Date(date + 'T12:00:00'),
        payment_method:      'BANK_TRANSFER',
        recurring_income_id: recurringIncomeId,
        billing_month:       month,
        billing_year:        year,
      },
    })
  }

  revalidatePath('/planejamento')
  revalidatePath('/')
  revalidatePath('/transacoes')
  return { success: true }
}

export async function unconfirmRecurringIncomeAction(
  transactionId: string
) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  await prisma.transaction.deleteMany({
    where: { id: transactionId, household_id: user.householdId },
  })

  revalidatePath('/planejamento')
  revalidatePath('/')
  revalidatePath('/transacoes')
  return { success: true }
}
