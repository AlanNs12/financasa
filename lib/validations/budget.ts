import { z } from 'zod'

export const budgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  total_income: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  items: z.array(z.object({
    category_id: z.string(),
    planned: z.coerce.number().min(0),
  })),
})

export type BudgetInput = z.infer<typeof budgetSchema>
