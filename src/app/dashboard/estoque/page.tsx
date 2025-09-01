// import DashboardLayout from "@/components/layout/dashboard-layout";

export default function EstoqueHomePage() {
  return (
    <>
      <div className='bg-white border-bottom px-3 py-3'>
        <h1 className='h4 mb-1 text-dark'>Estoque</h1>
        <p className='text-muted mb-0'>
          Resumo rápido e atalhos para gestão e relatórios de estoque
        </p>
      </div>

      <div className='row g-3'>
        <div className='col-md-4'>
          <div className='card h-100'>
            <div className='card-body d-flex flex-column'>
              <h5 className='card-title'>Relatórios</h5>
              <p className='text-muted small flex-grow-1'>
                Produtos em falta, baixo estoque, movimentações e ranking.
              </p>
              <a href='/dashboard/estoque/relatorios' className='btn btn-primary mt-auto'>
                Abrir Relatórios
              </a>
            </div>
          </div>
        </div>
        <div className='col-md-4'>
          <div className='card h-100'>
            <div className='card-body d-flex flex-column'>
              <h5 className='card-title'>Movimentação</h5>
              <p className='text-muted small flex-grow-1'>
                Registrar entradas, saídas e ajustes de produtos.
              </p>
              <a href='/dashboard/estoque/movimentacao' className='btn btn-outline-primary mt-auto'>
                Movimentar Estoque
              </a>
            </div>
          </div>
        </div>
        <div className='col-md-4'>
          <div className='card h-100'>
            <div className='card-body d-flex flex-column'>
              <h5 className='card-title'>Produtos</h5>
              <p className='text-muted small flex-grow-1'>
                Gerenciar cadastro de produtos e tipos.
              </p>
              <a href='/dashboard/produtos' className='btn btn-outline-secondary mt-auto'>
                Ir para Produtos
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
