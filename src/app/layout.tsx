import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'おおさかけんぽう',
  description: '法律を大阪弁で親しみやすく解説するサイト',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}