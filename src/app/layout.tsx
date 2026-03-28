import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 복지 거버넌스',
  description: '경기도 AI 복지 정책 연구 세미나 운영 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='ko'>
      <body>{children}</body>
    </html>
  )
}