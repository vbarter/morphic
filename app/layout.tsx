import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import {Helmet} from "react-helmet";
import React from "react";

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = '搜米'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sosuo.me'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="https://analytics.us.umami.is/script.js"
                data-website-id="e9daaa83-b36c-4b49-80b6-d728a7d64a69"></script>
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <Header/>
        {children}
        <Sidebar/>
        {/*<Footer />*/}
      </ThemeProvider>
      </body>
      </html>
  )
}
