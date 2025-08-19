import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://osaka-kenpo.llll-ll.com'),
  title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
  description: '法律をおおさか弁で親しみやすく解説するサイト',
  keywords: ['法律', '憲法', '大阪弁', '関西弁', '法学', '条文', '解説'],
  authors: [{ name: 'kako-jun' }],
  creator: 'kako-jun',
  publisher: 'おおさかけんぽう',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
    description: '法律をおおさか弁で親しみやすく解説するサイト',
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
    description: '法律をおおさか弁で親しみやすく解説するサイト',
    images: ['/osaka-kenpo-logo.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
