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
  '基于AI的搜索引擎'

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
    creator: '@vbarter'
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
      {/*监控统计*/}
      <head>
          {/*<script defer src="https://smami.zeabur.app/script.js"*/}
          {/*        data-website-id="a7593bb2-b8cb-460b-b652-e6cc430cfdc9"></script>*/}
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
        {/*<Sidebar/>*/}
        {/*<Footer />*/}
      </ThemeProvider>
      </body>
      </html>
  )
}
