'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MenuItemComponentProps } from './types';

export default function MenuItemComponent({
  item,
  isActive,
  hasPermission,
  isExpanded,
  onToggle,
  sidebarOpen,
}: MenuItemComponentProps) {
  const router = useRouter();

  if (!hasPermission(item)) return null;

  const active = isActive(item.path);
  const hasChildren = item.children && item.children.length > 0;
  const isSection = item.label.toUpperCase() === item.label && hasChildren;

  return (
    <div className='mb-1'>
      <div
        className={`d-flex align-items-center text-decoration-none text-white p-3 rounded mb-1 position-relative ${
          active && !hasChildren ? 'bg-primary' : 'hover-bg-secondary'
        }`}
        style={{
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginLeft: '4px',
          marginRight: '4px',
        }}
        onClick={() => {
          if (hasChildren) {
            onToggle(item.id, true);
          } else {
            router.push(item.path);
          }
        }}
      >
        <span
          className='me-3'
          style={{ fontSize: '1.2rem', minWidth: '30px', textAlign: 'center' }}
        >
          {item.icon}
        </span>
        {sidebarOpen && (
          <>
            <span
              className='flex-grow-1'
              style={{
                fontSize: '0.95rem',
                fontWeight: isSection ? '600' : '400',
              }}
            >
              {item.label}
            </span>
            {hasChildren && (
              <span
                style={{
                  fontSize: '0.7rem',
                  transition: 'transform 0.25s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            )}
          </>
        )}
        {!sidebarOpen && hasChildren && (
          <div
            style={{
              position: 'absolute',
              right: '4px',
              top: '4px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--amarelo-principal)',
            }}
          />
        )}
      </div>

      {/* Submenu */}
      {sidebarOpen && hasChildren && (
        <div
          className='mb-2'
          style={{
            maxHeight: isExpanded ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.35s ease-in-out',
            paddingLeft: '8px',
          }}
        >
          {item.children!.map((child, index) => {
            if (!hasPermission(child)) return null;

            const childActive = isActive(child.path);

            return (
              <Link
                key={child.id}
                href={child.path}
                className={`d-flex align-items-center text-decoration-none text-white p-2 ps-3 rounded mb-1 position-relative ${
                  childActive ? 'bg-primary' : 'hover-bg-secondary'
                }`}
                style={{
                  fontSize: '0.875rem',
                  marginLeft: '4px',
                  marginRight: '4px',
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                  transition: `all 0.3s ease-in-out ${index * 0.05}s`,
                  borderLeft: childActive
                    ? '3px solid var(--amarelo-principal)'
                    : '3px solid transparent',
                }}
              >
                <span
                  className='me-2'
                  style={{
                    fontSize: '0.9rem',
                    minWidth: '25px',
                    textAlign: 'center',
                    opacity: 0.9,
                  }}
                >
                  {child.icon}
                </span>
                <span style={{ fontWeight: childActive ? '500' : '400' }}>{child.label}</span>
                {childActive && (
                  <span
                    className='ms-auto'
                    style={{ fontSize: '0.6rem', color: 'var(--amarelo-principal)' }}
                  >
                    ●
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
