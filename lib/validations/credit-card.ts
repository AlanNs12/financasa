import { z } from 'zod'

export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  issuer: z.string().optional(),
  spending_cap: z.coerce.number().min(0, 'Teto não pode ser negativo').optional(),
  closing_day: z.coerce.number().int().min(1, 'Dia inválido').max(31, 'Dia inválido').optional(),
  due_day: z.coerce.number().int().min(1, 'Dia inválido').max(31, 'Dia inválido').optional(),
})

export type CreditCardInput = z.infer<typeof creditCardSchema>
