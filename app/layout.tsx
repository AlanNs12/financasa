import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Financasa - Controle Financeiro Familiar",
  description: "Aplicativo de controle financeiro para famílias",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${interSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):'light';if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`
          }}
        />
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  )
}
