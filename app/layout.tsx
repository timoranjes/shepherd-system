import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '小羊管理系統',
  description: '教會服事者專用的小羊管理系統',
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
    <html lang="zh-Hant" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1516467508483-a7212fe1c8ba?w=1920&q=80)',
            }}
          />
          <ErrorBoundary>
            <QueryProvider>
              <LanguageProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </LanguageProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
