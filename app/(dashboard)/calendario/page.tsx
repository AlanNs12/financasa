import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getCalendarData } from '@/lib/db/queries/calendar'
import { redirect } from 'next/navigation'
import { CalendarioClient } from '@/components/calendario/calendario-client'

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export const metadata = { title: 'Calendário — Financasa' }

export default async function CalendarioPage({ searchParams }: Props) {
  const user = await getCurrentUserHousehold()
  if (!user) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const month = Number(params.month) || now.getMonth() + 1
  const year  = Number(params.year)  || now.getFullYear()

  const dayMap = await getCalendarData(user.householdId, month, year)

  return (
    <CalendarioClient
      dayMap={dayMap}
      month={month}
      year={year}
    />
  )
}
