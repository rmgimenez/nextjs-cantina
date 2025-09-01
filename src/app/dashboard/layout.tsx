import type { Metadata } from 'next';
import DashboardLayout from '../../components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'Dashboard - Sistema Cantina',
  description: 'Sistema de controle de cantina escolar - Dashboard',
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  // Wrap dashboard pages with the client-side DashboardLayout (header + sidebar)
  return <DashboardLayout>{children}</DashboardLayout>;
}
