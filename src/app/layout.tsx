import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 복지 거버넌스',
  description: '경기복지재단 AI 복지 정책 연구 세미나 운영 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#1e3a8a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI 복지 거버넌스',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}