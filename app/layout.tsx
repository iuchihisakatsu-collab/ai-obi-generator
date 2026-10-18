import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIオーダーメイド帯ジェネレーター',
  description: 'AIであなただけの帯図案をお誂えします',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
