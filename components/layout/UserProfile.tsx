import { UserProfileProps } from './types';

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className='d-flex align-items-center'>
      <div className='me-3 text-end'>
        <div className='fw-bold text-dark'>{user.nome}</div>
        <small className='text-muted'>{user.perfil === 1 ? 'Administrador' : 'Operador'}</small>
      </div>

      <div className='dropdown'>
        <button
          className='btn btn-outline-secondary dropdown-toggle'
          type='button'
          data-bs-toggle='dropdown'
        >
          <span className='me-2'>👤</span>
          Conta
        </button>
        <ul className='dropdown-menu'>
          <li>
            <a className='dropdown-item' href='#' onClick={onLogout}>
              <span className='me-2'>🚪</span>
              Sair
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
