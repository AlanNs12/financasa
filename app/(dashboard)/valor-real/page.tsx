import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getHourlyValue } from '@/lib/db/queries/hourly-value'
import { redirect } from 'next/navigation'
import { ValorRealClient } from '@/components/valor-real/valor-real-client'

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export const metadata = { title: 'Valor Real — Financasa' }

export default async function ValorRealPage({ searchParams }: Props) {
  const user = await getCurrentUserHousehold()
  if (!user) redirect('/login')

  const p = await searchParams
  const now = new Date()
  const month = Number(p.month) || now.getMonth() + 1
  const year = Number(p.year) || now.getFullYear()

  const data = await getHourlyValue(user.householdId, month, year)

  return <ValorRealClient data={data} />
}
