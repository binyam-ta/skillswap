import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AppProvider } from '@/context/AppContext'

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Skill Swap Platform',
  description: 'A community-based exchange of expertise',
  keywords: ['skill swap', 'learning', 'community', 'expertise exchange', 'peer learning'],
  authors: [{ name: 'Skill Swap Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4F46E5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AppProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex justify-center md:justify-start">
                  <div className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-primary-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
                      />
                    </svg>
                    <span className="ml-2 text-lg font-bold text-gray-900">SkillSwap</span>
                  </div>
                </div>
                <div className="mt-8 md:mt-0">
                  <p className="text-center text-sm text-gray-500 md:text-right">
                    &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  )
}
