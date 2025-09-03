'use client';

import { FiRefreshCw, FiSearch } from 'react-icons/fi';

type Props = {
  busca: string;
  onBuscaChange: (s: string) => void;
  filtroCategoria: string;
  onFiltroChange: (s: string) => void;
  onBuscar: () => void;
};

export default function ProdutosFiltro({
  busca,
  onBuscaChange,
  filtroCategoria,
  onFiltroChange,
  onBuscar,
}: Props) {
  return (
    <div className='card shadow-sm mb-3'>
      <div className='card-body py-3'>
        <div className='row g-2 align-items-center'>
          <div className='col-12 col-md-5'>
            <div className='position-relative'>
              <FiSearch className='position-absolute top-50 translate-middle-y ms-2 text-muted' />
              <input
                type='text'
                value={busca}
                onChange={(e) => onBuscaChange(e.target.value)}
                placeholder='Buscar produto ou código'
                className='form-control ps-5'
              />
            </div>
          </div>
          <div className='col-8 col-md-4'>
            <select
              value={filtroCategoria}
              onChange={(e) => onFiltroChange(e.target.value)}
              className='form-select'
            >
              <option value=''>Todas as categorias</option>
              <option value='salgados'>Salgados</option>
              <option value='doces'>Doces</option>
              <option value='bebidas'>Bebidas</option>
              <option value='refeicoes'>Refeições</option>
            </select>
          </div>
          <div className='col-4 col-md-3 d-grid'>
            <button
              onClick={onBuscar}
              className='btn btn-primary d-flex align-items-center justify-content-center gap-2'
              title='Recarregar lista'
            >
              <FiRefreshCw /> <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
