import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

export const metadata: Metadata = {
  title: 'おおさかけんぽう',
  description: '法律を大阪弁で親しみやすく解説するサイト',
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
