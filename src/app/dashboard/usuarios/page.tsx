import UsuariosClient from './usuarios-client';

export const metadata = {
  title: 'Usuários - Dashboard',
};

export default function Page() {
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Usuários</h1>
        <p className='text-muted mb-0'>Gerenciar usuários do sistema</p>
      </div>
      <div>
        <UsuariosClient />
      </div>
    </>
  );
}
