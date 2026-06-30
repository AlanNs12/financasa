import { z } from 'zod'

export const recurringBillSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  due_day: z.coerce.number().min(1).max(31, 'Dia inválido'),
  recurrence: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL']),
  bill_type: z.enum(['fixa', 'parcelada']).default('fixa'),
  installment_total: z.coerce.number().min(2, 'Mínimo 2 parcelas').max(360, 'Máximo 360 parcelas').optional(),
}).refine(
  (data) => data.bill_type !== 'parcelada' || (data.installment_total && data.installment_total >= 2),
  { message: 'Informe o número de parcelas', path: ['installment_total'] }
)

export type RecurringBillInput = z.infer<typeof recurringBillSchema>
