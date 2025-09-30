import type { FormaPagamento, TipoCliente } from '../types';

interface SeletorTipoClienteProps {
  tipoCliente: TipoCliente;
  onChangeTipoCliente: (tipo: TipoCliente, formaPagamento: FormaPagamento) => void;
  onLimparVenda: () => void;
}

export function SeletorTipoCliente({
  tipoCliente,
  onChangeTipoCliente,
  onLimparVenda,
}: SeletorTipoClienteProps) {
  return (
    <div className='card mb-3 border-0 shadow-sm'>
      <div className='card-body py-2'>
        <div className='row g-2 align-items-center'>
          <div className='col-auto'>
            <label className='col-form-label fw-semibold'>Tipo de Cliente:</label>
          </div>
          <div className='col-auto'>
            <div className='btn-group' role='group'>
              <input
                type='radio'
                className='btn-check'
                name='tipoCliente'
                id='tipoAluno'
                value='ALUNO'
                checked={tipoCliente === 'ALUNO'}
                onChange={() => onChangeTipoCliente('ALUNO', 'SALDO')}
              />
              <label className='btn btn-outline-primary' htmlFor='tipoAluno'>
                👨‍🎓 Aluno
              </label>

              <input
                type='radio'
                className='btn-check'
                name='tipoCliente'
                id='tipoFuncionario'
                value='FUNCIONARIO'
                checked={tipoCliente === 'FUNCIONARIO'}
                onChange={() => onChangeTipoCliente('FUNCIONARIO', 'CONTA_FUNCIONARIO')}
              />
              <label className='btn btn-outline-primary' htmlFor='tipoFuncionario'>
                👔 Funcionário
              </label>

              <input
                type='radio'
                className='btn-check'
                name='tipoCliente'
                id='tipoGeral'
                value='GERAL'
                checked={tipoCliente === 'GERAL'}
                onChange={() => onChangeTipoCliente('GERAL', 'DINHEIRO')}
              />
              <label className='btn btn-outline-primary' htmlFor='tipoGeral'>
                🛒 Geral
              </label>
            </div>
          </div>
          <div className='col-auto ms-auto'>
            <button
              className='btn btn-outline-danger btn-sm'
              onClick={onLimparVenda}
              title='Limpar venda (ESC)'
            >
              🗑️ Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
