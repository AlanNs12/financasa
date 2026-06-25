import { z } from 'zod'

export const recurringBillSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  due_day: z.coerce.number().min(1).max(31, 'Dia inválido'),
  recurrence: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL']),
})

export type RecurringBillInput = z.infer<typeof recurringBillSchema>
