import type React from "react"
import type { Metadata } from "next"
import { Inter, Dancing_Script } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Analytics from "@/components/analytics"
import { Suspense } from "react"

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

export const metadata: Metadata = {
  metadataBase: new URL("https://atelierdarubi.com.br"),
  title: {
    default: "Atelier da Rubi - Bordados Infantis Delicados",
    template: "%s | Atelier da Rubi",
  },
  description: "Bordados infantis delicados em Arraial do Cabo e Região dos Lagos",
  keywords: ["bordado infantil", "Arraial do Cabo", "Região dos Lagos", "bordados personalizados"],
  authors: [{ name: "Rubiana Lima" }],
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
      </head>
      <body className={`${inter.variable} ${dancing.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <Analytics />
          <Header />
          {children}
          <Footer />
        </Suspense>
      </body>
    </html>
  )
}
