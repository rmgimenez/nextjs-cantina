import UsuariosClient from './usuarios-client';

export const metadata = {
  title: 'Usuários - Dashboard',
};

import DashboardLayout from '@/components/layout/dashboard-layout';

export default function Page() {
  return (
    <DashboardLayout title='Usuários' subtitle='Gerenciar usuários do sistema'>
      <div>
        <UsuariosClient />
      </div>
    </DashboardLayout>
  );
}
