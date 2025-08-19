import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Sistema Cantina',
  description: 'Sistema de controle de cantina escolar - Dashboard',
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
