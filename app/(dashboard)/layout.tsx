import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Header } from '@/components/layout/header'
import { getCurrentUser } from '@/lib/db/queries/user'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-60">
        <Header user={user} />
        <main className="p-4 lg:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}