import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'WALLET', 'INVESTMENT', 'OTHER']).default('CHECKING'),
  institution: z.string().optional(),
  initial_balance: z.coerce.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const transferSchema = z
  .object({
    from_account_id: z.string().min(1, 'Conta de origem obrigatória'),
    to_account_id: z.string().min(1, 'Conta de destino obrigatória'),
    amount: z.coerce.number().positive('Valor deve ser positivo'),
    date: z.string().min(1, 'Data obrigatória'),
    description: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.from_account_id !== data.to_account_id, {
    message: 'Conta de destino deve ser diferente da origem',
    path: ['to_account_id'],
  })

export type AccountInput = z.infer<typeof accountSchema>
export type TransferInput = z.infer<typeof transferSchema>
