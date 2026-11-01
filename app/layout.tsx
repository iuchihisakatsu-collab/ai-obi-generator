import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '妄想きもの図案帳',
  description: '世界で１枚の着物や帯をスマホだけで作れるアプリ',
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
