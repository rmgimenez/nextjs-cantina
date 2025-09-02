// import DashboardLayout from '@/components/layout/dashboard-layout';
import ProdutosClient from "./produtos-client";
import { query } from "@/lib/db";

async function fetchProdutos() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/produtos`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.produtos || [];
  } catch (e) {
    return [];
  }
}

async function fetchTipos() {
  // Server-side: buscar diretamente no banco para evitar que o middleware
  // redirecione a chamada ao /api quando não houver cookie disponível.
  try {
    const rows = await query(
      `SELECT id, descricao, codigo, exige_peso, ativo, created_at FROM cant_produto_tipo WHERE ativo = 1 ORDER BY descricao LIMIT 200`
    );
    return rows || [];
  } catch (e) {
    console.error("fetchTipos db error", e);
    return [];
  }
}

export default async function ProdutosPage() {
  const [produtos, tipos] = await Promise.all([fetchProdutos(), fetchTipos()]);
  return (
    <>
      <div className="bg-white border-bottom px-3 py-3">
        <h1 className="h4 mb-1 text-dark">Produtos</h1>
        <p className="text-muted mb-0">Gerenciamento de produtos da cantina</p>
      </div>

      <ProdutosClient initialProdutos={produtos} initialTipos={tipos} />
    </>
  );
}
