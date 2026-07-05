import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="flex flex-col justify-center px-6 py-12 lg:px-16
                      bg-background">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Logo size={36} variant="auto"
                  className="text-primary" />
            <span className="text-xl font-semibold text-foreground">
              Financasa
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {children}
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center
                      bg-[#0F1115] relative overflow-hidden p-12">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full
                        bg-white/[0.03] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full
                        bg-white/[0.03] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full
                        bg-white/[0.02] -translate-y-1/2" />

        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size={56} variant="light" />
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight tracking-tight">
            Controle financeiro para sua família
          </h2>
          <p className="text-white/50 text-base leading-relaxed">
            Planeje, acompanhe e realize seus objetivos
            financeiros juntos, de forma simples e organizada.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-10">
            {[
              { icon: '📊', label: 'Relatórios' },
              { icon: '🎯', label: 'Metas' },
              { icon: '💰', label: 'Investimentos' },
            ].map(({ icon, label }) => (
              <div key={label}
                   className="bg-white/[0.06] border border-white/10 rounded-xl
                              p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-white/60 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
