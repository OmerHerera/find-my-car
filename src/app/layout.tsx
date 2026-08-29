import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const bodyFont = Barlow({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const displayFont = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Find My Car',
  description: 'Keep track of where your family cars are parked.',
  applicationName: 'Find My Car',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
