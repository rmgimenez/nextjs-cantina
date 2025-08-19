import DashboardLayout from '@/components/layout/dashboard-layout';
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
    <DashboardLayout title='Produtos' subtitle='Gerenciamento de produtos da cantina'>
      <ProdutosClient initialProdutos={produtos} initialTipos={tipos} />
    </DashboardLayout>
  );
}
