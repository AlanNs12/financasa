'use client'

import { PersonAvatar } from '@/components/shared/person-avatar'
import { formatDate } from '@/lib/format'

interface Member {
  id: string
  name: string
  email: string
  avatar_url: string | null
  created_at: string
}

interface HouseholdMembersProps {
  members: Member[]
  currentUserId: string
}

export function HouseholdMembers({ members, currentUserId }: HouseholdMembersProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Membros da casa ({members.length})
      </h2>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
          >
            <PersonAvatar
              user={{ name: member.name, avatar_url: member.avatar_url }}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.name}
                </p>
                {member.id === currentUserId && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    Você
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p>
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              desde {formatDate(new Date(member.created_at))}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
