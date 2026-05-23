import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Project Pulse — Your Gym Companion',
  description: 'Track workouts, nutrition, and fitness progress. Built for the gym.',
};

/**
 * viewport-fit=cover is REQUIRED for env(safe-area-inset-*) to return
 * non-zero values on notched/pill-bar devices. Without it, the browser
 * handles safe areas itself and env() returns 0.
 */
export const viewport: Viewport = {
  themeColor: '#040816',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
