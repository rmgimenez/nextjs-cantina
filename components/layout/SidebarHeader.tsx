import { SidebarHeaderProps } from './types';

export default function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  return (
    <>
      <div
        className='d-flex align-items-center justify-content-between p-3 border-bottom border-secondary'
        style={{ minHeight: '70px' }}
      >
        <div className={`d-flex align-items-center ${!isOpen && 'justify-content-center w-100'}`}>
          <div
            className='bg-primary rounded d-flex align-items-center justify-content-center'
            style={{ width: '45px', height: '45px', fontSize: '1.5rem', flexShrink: 0 }}
          >
            🍽️
          </div>
          {isOpen && (
            <div className='ms-3'>
              <h5 className='mb-0 text-white fw-bold'>Cantina Escolar</h5>
              <small className='text-muted' style={{ fontSize: '0.75rem' }}>
                Sistema de Controle
              </small>
            </div>
          )}
        </div>
        {isOpen && (
          <button
            className='btn btn-link text-white p-0'
            onClick={onToggle}
            style={{ fontSize: '1.2rem', minWidth: '30px' }}
            title='Recolher menu'
          >
            ◁
          </button>
        )}
      </div>

      {/* Toggle button quando fechado */}
      {!isOpen && (
        <div className='text-center py-2 border-bottom border-secondary'>
          <button
            className='btn btn-link text-white p-0'
            onClick={onToggle}
            style={{ fontSize: '1.2rem' }}
            title='Expandir menu'
          >
            ▷
          </button>
        </div>
      )}
    </>
  );
}
