import { z } from 'zod'

export const recurringIncomeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  recurrence: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL']),
  start_month: z.coerce.number().min(1).max(12),
  start_year: z.coerce.number().min(2020).max(2100),
})

export type RecurringIncomeInput = z.infer<typeof recurringIncomeSchema>
