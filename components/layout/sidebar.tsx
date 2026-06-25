'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Target,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/contas', icon: Receipt, label: 'Contas' },
  { href: '/planejamento', icon: Target, label: 'Planejamento' },
  { href: '/metas', icon: Trophy, label: 'Metas' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200 z-30">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900">Financasa</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          href="/configuracoes"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/configuracoes'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Settings className="w-5 h-5" />
          Configurações
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
