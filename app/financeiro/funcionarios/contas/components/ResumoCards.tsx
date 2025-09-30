import type { ResumoContas } from '../types';
import { formatCurrency } from '../utils';

interface ResumoCardsProps {
  resumo: ResumoContas;
}

export function ResumoCards({ resumo }: ResumoCardsProps) {
  return (
    <div className='row g-3 mb-4'>
      <div className='col-md-3'>
        <div className='card border-0 shadow-sm h-100'>
          <div className='card-body'>
            <h6 className='text-muted'>Contas ativas</h6>
            <h4 className='mb-0 text-primary'>{resumo.contasAtivas}</h4>
          </div>
        </div>
      </div>
      <div className='col-md-3'>
        <div className='card border-0 shadow-sm h-100'>
          <div className='card-body'>
            <h6 className='text-muted'>Total em aberto</h6>
            <h4 className='mb-0 text-danger'>{formatCurrency(resumo.totalAberto)}</h4>
          </div>
        </div>
      </div>
      <div className='col-md-3'>
        <div className='card border-0 shadow-sm h-100'>
          <div className='card-body'>
            <h6 className='text-muted'>Limite total configurado</h6>
            <h4 className='mb-0 text-secondary'>{formatCurrency(resumo.totalLimite)}</h4>
          </div>
        </div>
      </div>
      <div className='col-md-3'>
        <div className='card border-0 shadow-sm h-100'>
          <div className='card-body'>
            <h6 className='text-muted'>Contas no limite</h6>
            <h4 className='mb-0 text-warning'>{resumo.contasCriticas}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
