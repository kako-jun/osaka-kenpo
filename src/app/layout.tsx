import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

export const metadata: Metadata = {
  title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
  description: '法律をおおさか弁で親しみやすく解説するサイト',
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
