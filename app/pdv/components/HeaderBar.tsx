import type { StatusCaixa } from '../types';

interface HeaderBarProps {
  statusCaixa: StatusCaixa | null;
}

export function HeaderBar({ statusCaixa }: HeaderBarProps) {
  return (
    <div className='d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm mb-3'>
      <div>
        <h4 className='mb-0'>
          <strong>PDV - Ponto de Venda</strong>
        </h4>
        <small>
          Caixa: <strong>{statusCaixa?.aberto ? 'ABERTO' : 'FECHADO'}</strong>
          {statusCaixa?.aberto && (
            <span className='ms-3'>
              Valor esperado: R$ {Number(statusCaixa?.totais?.esperado || 0).toFixed(2)}
            </span>
          )}
        </small>
      </div>
      <div>
        <a href='/caixa' className='btn btn-light btn-sm'>
          Gerenciar Caixa
        </a>
      </div>
    </div>
  );
}
