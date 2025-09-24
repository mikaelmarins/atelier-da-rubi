import type { Metadata } from "next"
import Hero from "@/components/hero"
import About from "@/components/about"
import FeaturedCarousel from "@/components/featured-carousel"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"

export const metadata: Metadata = {
  title: "Atelier da Rubi - Bordados Infantis Delicados | Arraial do Cabo e Região dos Lagos",
  description:
    "Bordados infantis únicos e delicados criados com amor pela Rubiana Lima em Arraial do Cabo. Atendemos toda a Região dos Lagos e fazemos envios para todo o Brasil. Jogos de berço, toalhas RN, kits gestante e muito mais.",
  keywords:
    "bordado infantil, Arraial do Cabo, Região dos Lagos, bordados personalizados, roupas bebê, Rubiana Lima, atelier bordado, jogos de berço, toalhas recém nascido, kit gestante, envios Brasil",
  authors: [{ name: "Rubiana Lima" }],
  creator: "Atelier da Rubi",
  publisher: "Atelier da Rubi",
  openGraph: {
    title: "Atelier da Rubi - Bordados Infantis Delicados",
    description:
      "Bordados infantis únicos criados com amor em Arraial do Cabo. Atendemos toda a Região dos Lagos e enviamos para todo o Brasil.",
    type: "website",
    locale: "pt_BR",
    url: "https://atelierdarubi.com.br",
    siteName: "Atelier da Rubi",
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
    google: "your-google-verification-code",
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Atelier da Rubi",
            description: "Bordados infantis únicos e delicados",
            url: "https://atelierdarubi.com.br",
            telephone: "+55-22-99999-9999",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Arraial do Cabo",
              addressRegion: "RJ",
              addressCountry: "BR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: -22.9661,
              longitude: -42.0278,
            },
            openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-14:00"],
            sameAs: ["https://instagram.com/atelierdarubi", "https://wa.me/5522999999999"],
            founder: {
              "@type": "Person",
              name: "Rubiana Lima",
            },
            areaServed: [
              {
                "@type": "State",
                name: "Rio de Janeiro",
              },
              {
                "@type": "Country",
                name: "Brasil",
              },
            ],
            serviceType: "Bordados Infantis Artesanais",
          }),
        }}
      />
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Hero />
        <FeaturedCarousel />
        <About />
        <Testimonials />
        <Contact />
      </main>
    </>
  )
}
