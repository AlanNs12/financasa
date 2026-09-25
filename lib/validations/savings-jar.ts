import { z } from 'zod'

export const savingsJarSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  account_id: z.string().min(1, 'Conta obrigatória'),
  target_amount: z.coerce.number().min(0, 'Meta não pode ser negativa').optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const jarMovementSchema = z.object({
  jar_id: z.string().min(1, 'Cofrinho obrigatório'),
  type: z.enum(['DEPOSIT', 'WITHDRAW']),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().optional(),
  note: z.string().optional(),
})

export type SavingsJarInput = z.infer<typeof savingsJarSchema>
export type JarMovementInput = z.infer<typeof jarMovementSchema>
