import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="lg:pl-60">
        <Header />
        <main className="p-4 lg:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
