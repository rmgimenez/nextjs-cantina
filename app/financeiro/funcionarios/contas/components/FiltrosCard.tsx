import type { FiltrosContas } from '../types';
import { normalizeDecimalInput } from '../utils';

interface FiltrosCardProps {
  filtros: FiltrosContas;
  onFiltrosChange: (filtros: FiltrosContas) => void;
}

export function FiltrosCard({ filtros, onFiltrosChange }: FiltrosCardProps) {
  const handleChange = (field: keyof FiltrosContas, value: string) => {
    onFiltrosChange({
      ...filtros,
      [field]: value,
    });
  };

  return (
    <div className='card border-0 shadow-sm mb-4'>
      <div className='card-body'>
        <div className='row g-3'>
          <div className='col-md-3'>
            <label className='form-label'>Buscar por nome ou código</label>
            <input
              type='text'
              className='form-control'
              placeholder='Ex.: 123 ou João'
              value={filtros.searchTerm}
              onChange={(e) => handleChange('searchTerm', e.target.value)}
            />
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Status</label>
            <select
              className='form-select'
              value={filtros.statusFilter}
              onChange={(e) => handleChange('statusFilter', e.target.value)}
            >
              <option value=''>Todos</option>
              <option value='1'>Ativo</option>
              <option value='0'>Inativo</option>
            </select>
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Cargo</label>
            <input
              type='text'
              className='form-control'
              placeholder='Ex.: PROFESSOR'
              value={filtros.cargoFilter}
              onChange={(e) => handleChange('cargoFilter', e.target.value.toUpperCase())}
            />
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Limite mín.</label>
            <input
              type='text'
              className='form-control'
              inputMode='decimal'
              value={filtros.limiteMinFilter}
              onChange={(e) =>
                handleChange('limiteMinFilter', normalizeDecimalInput(e.target.value))
              }
            />
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Limite máx.</label>
            <input
              type='text'
              className='form-control'
              inputMode='decimal'
              value={filtros.limiteMaxFilter}
              onChange={(e) =>
                handleChange('limiteMaxFilter', normalizeDecimalInput(e.target.value))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
