import type React from "react"
import type { Metadata } from "next"
import { Inter, Dancing_Script, Playfair_Display } from 'next/font/google'
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Analytics from "@/components/analytics"
import { Suspense } from "react"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
  preload: true,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://atelierdarubi.com.br"),
  title: {
    default: "Atelier da Rubi - Bordados Infantis Delicados | Arraial do Cabo",
    template: "%s | Atelier da Rubi",
  },
  description:
    "Bordados infantis únicos e delicados criados com amor em Arraial do Cabo. Jogos de berço, toalhas RN, kits gestante. Atendemos Região dos Lagos e todo Brasil.",
  keywords: [
    "bordado infantil",
    "Arraial do Cabo",
    "Região dos Lagos",
    "Cabo Frio",
    "Búzios",
    "bordados personalizados",
    "roupas bebê",
    "jogo de berço",
    "toalha recém nascido",
    "kit gestante",
    "Rubiana Lima",
    "atelier bordado",
  ],
  authors: [{ name: "Rubiana Lima", url: "https://instagram.com/atelier.da.rubi" }],
  creator: "Atelier da Rubi",
  publisher: "Atelier da Rubi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://atelierdarubi.com.br",
    siteName: "Atelier da Rubi",
    title: "Atelier da Rubi - Bordados Infantis Delicados",
    description:
      "Bordados infantis únicos criados com amor em Arraial do Cabo. Atendemos toda a Região dos Lagos e enviamos para todo o Brasil.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Atelier da Rubi - Bordados Infantis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier da Rubi - Bordados Infantis Delicados",
    description: "Bordados infantis únicos criados com amor em Arraial do Cabo",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ADICIONAR_CODIGO_GOOGLE_SEARCH_CONSOLE",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL} />
      </head>
      <body className={`${inter.variable} ${dancing.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <CartProvider>
              <Analytics />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
