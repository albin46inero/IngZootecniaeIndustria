import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import Footer from "@/components/Footer";
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ingenieria en Zootecnia e Industria Pecuaria',
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
        {/* ✅ CSP válido para upgrade-insecure-requests */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      
      <body className={`${geist.className} ${geistMono.className} font-sans antialiased`}>
        <Header />
        
        <main className="relative z-10 min-h-screen pt-16">
          {children}
        </main>
        
        
        <Analytics />
      </body>
    </html>
  )
}