import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import BootstrapClient from './bootstrap-client';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema de Controle de Cantina Escolar',
  description: 'Sistema para gestão eficiente das operações de cantina escolar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
