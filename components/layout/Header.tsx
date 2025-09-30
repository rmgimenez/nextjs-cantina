import { HeaderProps } from './types';
import UserProfile from './UserProfile';

export default function Header({ user, currentPageTitle, onLogout }: HeaderProps) {
  return (
    <header
      className='bg-white border-bottom shadow-sm'
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}
    >
      <div className='d-flex justify-content-between align-items-center px-4 py-3'>
        <div>
          <h5 className='mb-0 text-dark'>{currentPageTitle}</h5>
        </div>

        <UserProfile user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
