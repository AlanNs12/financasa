'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/sidebar-context'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/contas', icon: Receipt, label: 'Contas' },
  { href: '/planejamento', icon: Target, label: 'Planejamento' },
  { href: '/metas', icon: Trophy, label: 'Metas' },
  { href: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
  { href: '/dividas', icon: TrendingDown, label: 'Dívidas' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function Sidebar() {
  const {
    isExpanded,
    isHovered,
    isMobileOpen,
    toggleExpanded,
    setIsHovered,
    closeMobile,
  } = useSidebar()
  const pathname = usePathname()
  const showLabels = isExpanded || isHovered

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => {
          if (!isExpanded) setIsHovered(true)
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-[50] hidden lg:flex flex-col',
          'bg-card border-r border-border',
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded || isHovered ? 'w-[290px]' : 'w-[88px]'
        )}
      >
        <SidebarInner
          showLabels={showLabels}
          pathname={pathname}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-[50] flex flex-col lg:hidden',
          'bg-card border-r border-border w-[290px]',
          'transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarInner
          showLabels={true}
          pathname={pathname}
          isExpanded={true}
          toggleExpanded={closeMobile}
        />
      </aside>
    </>
  )
}

function SidebarInner({
  showLabels,
  pathname,
  isExpanded,
  toggleExpanded,
}: {
  showLabels: boolean
  pathname: string
  isExpanded: boolean
  toggleExpanded: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-border shrink-0',
          showLabels ? 'justify-between' : 'justify-center'
        )}
      >
        {showLabels && (
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-brand-500 flex items-center
                          justify-center text-white font-bold text-sm"
            >
              F
            </div>
            <span className="text-base font-semibold text-foreground">
              Financasa
            </span>
          </Link>
        )}
        <button
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-muted-foreground hover:bg-muted hover:text-foreground
                     transition-colors shrink-0"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                'menu-item',
                isActive ? 'menu-item-active' : 'menu-item-inactive',
                !showLabels && 'justify-center px-0'
              )}
              title={!showLabels ? label : undefined}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-muted-foreground'
                }
                aria-hidden="true"
              />
              {showLabels && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          href="/configuracoes"
          prefetch={true}
          className={cn(
            'menu-item',
            pathname === '/configuracoes'
              ? 'menu-item-active'
              : 'menu-item-inactive',
            !showLabels && 'justify-center px-0'
          )}
          title={!showLabels ? 'Configurações' : undefined}
        >
          <Settings
            size={20}
            className={
              pathname === '/configuracoes'
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-muted-foreground'
            }
            aria-hidden="true"
          />
          {showLabels && <span>Configurações</span>}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              'menu-item menu-item-inactive w-full',
              !showLabels && 'justify-center px-0'
            )}
            title={!showLabels ? 'Sair' : undefined}
          >
            <LogOut size={20} className="text-muted-foreground" aria-hidden="true" />
            {showLabels && <span>Sair</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
