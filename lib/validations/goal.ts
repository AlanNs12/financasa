import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  target_amount: z.coerce.number().positive('Valor deve ser positivo'),
  current_amount: z.coerce.number().min(0, 'Valor não pode ser negativo').default(0),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type GoalInput = z.infer<typeof goalSchema>
