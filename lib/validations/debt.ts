import { z } from 'zod'

export const debtSchema = z.object({
  institution: z.string().min(1, 'Instituição obrigatória'),
  product: z.string().min(1, 'Produto obrigatório'),
  classification: z.enum([
    'EMPRESTIMO_PESSOAL',
    'FINANCIAMENTO_VEICULO',
    'FINANCIAMENTO_IMOVEL',
    'CARTAO_PARCELADO',
    'CONSIGINADO',
    'OUTROS',
  ]),
  down_payment: z.coerce.number().min(0, 'Valor não pode ser negativo').optional(),
  principal_amount: z.coerce.number().positive('Valor deve ser positivo'),
  started_at: z.string().min(1, 'Data de início obrigatória'),
  interest_rate: z.coerce.number().min(0, 'Taxa não pode ser negativa'),
  cet_rate: z.coerce.number().min(0, 'CET não pode ser negativa').optional(),
  installment_amount: z.coerce.number().positive('Valor deve ser positivo'),
  installment_total: z.coerce.number().int().min(1, 'Mínimo 1 parcela'),
})

export type DebtInput = z.infer<typeof debtSchema>
