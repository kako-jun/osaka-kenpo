import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://osaka-kenpo.llll-ll.com'),
  title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
  description:
    '法律をおおさか弁で親しみやすく解説するサイト。日本国憲法・民法・商法・会社法・刑法・民事訴訟法・刑事訴訟法の六法から、ドイツ基本法・アメリカ合衆国憲法・マグナカルタまで。',
  keywords: [
    '法律',
    '憲法',
    '大阪弁',
    '関西弁',
    '法学',
    '条文',
    '解説',
    '民法',
    '商法',
    '会社法',
    '刑法',
    '民事訴訟法',
    '刑事訴訟法',
    '六法',
    'AI推進法',
    '十七条憲法',
    'ドイツ基本法',
    'アメリカ合衆国憲法',
    '中華人民共和国憲法',
    'マグナカルタ',
    '南極条約',
  ],
  authors: [{ name: 'kako-jun' }],
  creator: 'kako-jun',
  publisher: 'おおさかけんぽう',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
    description:
      '法律をおおさか弁で親しみやすく解説するサイト。日本国憲法・民法・商法・会社法・刑法・民事訴訟法・刑事訴訟法の六法から、ドイツ基本法・アメリカ合衆国憲法・マグナカルタまで。',
    siteName: 'おおさかけんぽう',
    images: [
      {
        url: '/osaka-kenpo-logo.webp',
        width: 1200,
        height: 630,
        alt: 'おおさかけんぽう',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
    description: '法律をおおさか弁で親しみやすく解説。六法からドイツ基本法・マグナカルタまで。',
    images: ['/osaka-kenpo-logo.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ViewModeProvider } from './context/ViewModeContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <ViewModeProvider>
        <body className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto px-4 pt-2 pb-4">{children}</main>
          <Footer />
          <BackToTopButton />
        </body>
      </ViewModeProvider>
    </html>
  );
}
