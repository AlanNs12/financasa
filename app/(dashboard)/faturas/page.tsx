import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getFaturaData } from '@/lib/db/queries/faturas'
import { redirect } from 'next/navigation'
import { FaturasClient } from '@/components/faturas/faturas-client'

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export const metadata = { title: 'Faturas — Financasa' }

export default async function FaturasPage({ searchParams }: Props) {
  const user = await getCurrentUserHousehold()
  if (!user) redirect('/login')

  const p = await searchParams
  const now = new Date()
  const month = Number(p.month) || now.getMonth() + 1
  const year = Number(p.year) || now.getFullYear()

  const data = await getFaturaData(user.householdId, month, year)

  return <FaturasClient data={data} month={month} year={year} />
}
