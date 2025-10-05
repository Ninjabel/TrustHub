import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TRPCProvider } from '@/lib/trpc/provider'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrustHub - Regulatory Compliance Platform',
  description: 'Modern regulatory compliance and reporting platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <body className={`${inter.className} overflow-hidden`}>
        <Providers>
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
