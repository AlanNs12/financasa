import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { Toaster } from "sonner"
import { cookies } from "next/headers"   // ← adicionar
import "./globals.css"

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Financasa - Controle Financeiro Familiar",
  description: "Aplicativo de controle financeiro para famílias",
}

export default async function RootLayout({   // ← adicionar async
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()         // ← adicionar
  const theme = cookieStore.get("theme")?.value ?? "light"  // ← adicionar

  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}  // ← adicionar dark
      suppressHydrationWarning
    >
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