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
