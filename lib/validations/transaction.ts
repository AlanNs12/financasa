import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição obrigatória'),
  date: z.string().min(1, 'Data obrigatória'),
  category_id: z.string().min(1, 'Categoria obrigatória'),
  payment_method: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO']),
  notes: z.string().optional(),
  credit_card_id: z.string().optional().nullable(),
  installments: z.coerce.number().int().min(1).max(72).optional().default(1),
  total_amount: z.coerce.number().positive().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionOutput = z.output<typeof transactionSchema>
