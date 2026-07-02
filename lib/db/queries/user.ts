import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { createDefaultCategories } from '@/lib/db/queries/categories'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function createUniqueInviteCode(): Promise<string> {
  let code = generateInviteCode()
  let existing = await prisma.household.findUnique({ where: { invite_code: code } })
  while (existing) {
    code = generateInviteCode()
    existing = await prisma.household.findUnique({ where: { invite_code: code } })
  }
  return code
}

export async function getCurrentUserHousehold(): Promise<{
  userId: string
  householdId: string
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, household_id: true },
  })

  if (!dbUser) return null

  return { userId: dbUser.id, householdId: dbUser.household_id }
}

export async function getCurrentUser(): Promise<{
  id: string
  name: string
  avatarUrl: string | null
  householdId: string
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabase_id: user.id },
    select: { id: true, name: true, avatar_url: true, household_id: true },
  })

  if (!dbUser) return null

  return {
    id: dbUser.id,
    name: dbUser.name,
    avatarUrl: dbUser.avatar_url,
    householdId: dbUser.household_id,
  }
}

export async function createUserAndHousehold(
  supabaseId: string,
  name: string,
  email: string
): Promise<{ userId: string; householdId: string }> {
  const inviteCode = await createUniqueInviteCode()

  const household = await prisma.household.create({
    data: {
      name: `Casa de ${name.split(' ')[0]}`,
      invite_code: inviteCode,
    },
  })

  const user = await prisma.user.create({
    data: {
      supabase_id: supabaseId,
      name,
      email,
      household_id: household.id,
    },
  })

  await createDefaultCategories(household.id)

  return { userId: user.id, householdId: household.id }
}

export async function joinHouseholdByInviteCode(
  supabaseId: string,
  name: string,
  email: string,
  inviteCode: string
): Promise<{ userId: string; householdId: string } | null> {
  const household = await prisma.household.findUnique({
    where: { invite_code: inviteCode },
  })

  if (!household) return null

  const existingUser = await prisma.user.findUnique({
    where: { supabase_id: supabaseId },
  })

  if (existingUser) return null

  const user = await prisma.user.create({
    data: {
      supabase_id: supabaseId,
      name,
      email,
      household_id: household.id,
    },
  })

  return { userId: user.id, householdId: household.id }
}

export async function getHouseholdInviteCode(
  householdId: string
): Promise<string | null> {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { invite_code: true },
  })

  return household?.invite_code ?? null
}

export async function getHouseholdMembers(householdId: string) {
  const members = await prisma.user.findMany({
    where: { household_id: householdId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      created_at: true,
    },
    orderBy: { created_at: 'asc' },
  })

  return members.map((m) => ({
    ...m,
    created_at: m.created_at.toISOString(),
  }))
}
