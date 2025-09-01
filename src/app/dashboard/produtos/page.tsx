// import DashboardLayout from '@/components/layout/dashboard-layout';
import ProdutosClient from './produtos-client';

async function fetchProdutos() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/produtos`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.produtos || [];
  } catch (e) {
    return [];
  }
}

async function fetchTipos() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/produtos/tipos`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tipos || [];
  } catch (e) {
    return [];
  }
}

export default async function ProdutosPage() {
  const [produtos, tipos] = await Promise.all([fetchProdutos(), fetchTipos()]);
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Produtos</h1>
        <p className='text-muted mb-0'>Gerenciamento de produtos da cantina</p>
      </div>

      <ProdutosClient initialProdutos={produtos} initialTipos={tipos} />
    </>
  );
}
