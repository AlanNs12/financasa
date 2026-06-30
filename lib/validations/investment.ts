import { z } from 'zod'

export const investmentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  asset_type: z.enum([
    'RESERVA_EMERGENCIA',
    'RENDA_FIXA',
    'RENDA_VARIAVEL',
    'PREVIDENCIA',
    'FUNDOS',
    'CRIPTO',
    'OUTROS',
  ]),
  goal_id: z.string().optional().nullable(),
  rate_description: z.string().optional(),
  applied_at: z.string().min(1, 'Data de aplicação obrigatória'),
  maturity_at: z.string().optional().nullable(),
  gross_invested: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  gross_current: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  net_current: z.coerce.number().min(0, 'Valor não pode ser negativo'),
})

export type InvestmentInput = z.infer<typeof investmentSchema>
