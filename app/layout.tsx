import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import './globals.css'
import Favicon from "@/components/favicon";
import Footer from "@/components/Footer";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ingenieria en Zootecnia e Industria Pecuaria  - Universidad Pública de El Alto',
  description: 'Forma el futuro de los líderes empresariales. Obtén tu licenciatura en Administración de Empresas con nuestro programa de clase mundial.',
  generator: 'v0.app',
  
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* ✅ Solo dejamos este que SÍ funciona */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        
        {/* ❌ ELIMINADOS - Estos NO funcionan en meta tags */}
        {/* <meta httpEquiv="X-Frame-Options" content="DENY" /> */}
        {/* <meta httpEquiv="X-Content-Type-Options" content="nosniff" /> */}
      </head>
      
      <body className={`${geist.className} ${geistMono.className} font-sans antialiased`}>
        <Favicon />
        <Header />
        
        <main className="relative z-10">
          {children}
        </main>
        
        
        <Analytics />
      </body>
    </html>
  )
}