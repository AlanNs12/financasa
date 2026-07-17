import { prisma } from '@/lib/db/prisma'
import { getEffectiveIncome } from './budget'

export async function getHourlyValue(
  householdId: string,
  month: number,
  year: number
) {
  const [household, incomeData] = await Promise.all([
    prisma.household.findUnique({
      where: { id: householdId },
      select: { work_hours_per_day: true },
    }),
    getEffectiveIncome(householdId, month, year),
  ])

  const hoursPerDay = household?.work_hours_per_day ?? 12
  const daysInMonth = new Date(year, month, 0).getDate()
  const totalHours = daysInMonth * hoursPerDay
  const monthlyIncome = incomeData.effectiveIncome

  const hourlyRate = totalHours > 0 ? monthlyIncome / totalHours : 0

  return {
    monthlyIncome,
    hoursPerDay,
    daysInMonth,
    totalHours,
    hourlyRate,
  }
}
