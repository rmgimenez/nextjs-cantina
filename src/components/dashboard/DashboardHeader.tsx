'use client';

import React from 'react';
import { FiBarChart, FiCalendar, FiShield, FiShoppingCart, FiTool } from 'react-icons/fi';

interface DashboardHeaderProps {
  userRole: string;
  userName?: string;
}

export default function DashboardHeader({ userRole, userName }: DashboardHeaderProps) {
  const getRoleConfig = () => {
    const role = userRole.toUpperCase();

    switch (role) {
      case 'ADMIN':
        return {
          title: 'Visão completa das operações da cantina',
          icon: <FiShield className='me-2' />,
          gradient: 'linear-gradient(135deg, #FEA800, #ff8f00)',
          label: 'Administrador',
        };
      case 'ESTOQUISTA':
        return {
          title: 'Controle de estoque e inventário',
          icon: <FiTool className='me-2' />,
          gradient: 'linear-gradient(135deg, #B20000, #d32f2f)',
          label: 'Estoquista',
        };
      default:
        return {
          title: 'Gestão de vendas e atendimento',
          icon: <FiShoppingCart className='me-2' />,
          gradient: 'linear-gradient(135deg, #253287, #3949ab)',
          label: 'Atendente',
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div
      className='px-4 py-6 shadow-lg'
      style={{
        background: 'linear-gradient(135deg, var(--primary-blue), #1a237e)',
        color: 'var(--primary-light)',
      }}
    >
      <div className='d-flex align-items-center justify-content-between'>
        <div>
          <h1 className='h3 mb-2 d-flex align-items-center' style={{ fontWeight: 700 }}>
            <FiBarChart className='me-3' size={28} />
            Dashboard
          </h1>
          <p className='mb-0 text-base' style={{ color: 'var(--primary-light)', opacity: 0.95 }}>
            {roleConfig.title}
          </p>
          {userName && (
            <p
              className='mb-0 text-sm mt-1'
              style={{ color: 'var(--primary-light)', opacity: 0.9 }}
            >
              Bem-vindo(a), {userName}
            </p>
          )}
        </div>

        <div className='d-flex align-items-center'>
          {/* Badge de perfil */}
          <div className='mr-4'>
            <div
              className='px-4 py-3 rounded-full text-white font-bold flex items-center shadow-lg'
              style={{ background: roleConfig.gradient }}
            >
              {React.cloneElement(roleConfig.icon as any, { className: 'mr-2' })}
              <span>{roleConfig.label}</span>
            </div>
          </div>

          {/* Data atual */}
          <div className='text-right'>
            <div style={{ color: 'var(--primary-light)', opacity: 0.9, fontSize: '0.9rem' }}>
              Hoje
            </div>
            <div
              style={{
                color: 'var(--primary-light)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiCalendar className='me-2' />
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
