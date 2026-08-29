import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Presupuestal | Control',
  description: 'Sistema Financiero',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#0B0F19] text-slate-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
