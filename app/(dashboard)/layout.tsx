import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Header } from '@/components/layout/header'
import { Backdrop } from '@/components/layout/backdrop'
import { MainContent } from '@/components/layout/main-content'
import { SidebarProvider } from '@/lib/sidebar-context'
import { BalanceVisibilityProvider } from '@/lib/balance-visibility-context'
import { getCurrentUser } from '@/lib/db/queries/user'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <SidebarProvider>
      <BalanceVisibilityProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <Backdrop />
          <MainContent>
            <Header user={user} />
            <main className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-[1280px] mx-auto">
              {children}
            </main>
          </MainContent>
          <BottomNav />
        </div>
      </BalanceVisibilityProvider>
    </SidebarProvider>
  )
}