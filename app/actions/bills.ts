'use server'

import { revalidatePath } from 'next/cache'
import { updateBillStatus } from '@/lib/db/queries/bills'
import { BillStatus } from '@prisma/client'

export async function markBillAsPaidAction(
  billId: string,
  month: number,
  year: number,
  paidAmount?: number
) {
  await updateBillStatus(billId, month, year, BillStatus.PAID, paidAmount)
  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}
