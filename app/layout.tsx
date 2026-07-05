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
  icons: {
    icon: [
      { url: "/financasa-icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/financasa-icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/financasa-icons/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/financasa-icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/financasa-icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/financasa-icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/financasa-icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/financasa-icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/financasa-icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/financasa-icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/financasa-icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/financasa-icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      {
        url: "/financasa-icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
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