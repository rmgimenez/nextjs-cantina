'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import type { ContaFuncionario } from './types';
import { useAuth, useContas } from './hooks';
import {
  HeaderBar,
  FiltrosCard,
  ResumoCards,
  TabelaContas,
  ContaModal,
} from './components';

export default function ContasFuncionariosPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    contas,
    loading: listLoading,
    errorMessage,
    filtros,
    setFiltros,
    resumo,
    loadContas,
    handleToggleStatus,
  } = useContas(user);

  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaFuncionario | null>(null);

  const handleNovaConta = () => {
    setEditingConta(null);
    setShowModal(true);
  };

  const handleEditConta = (conta: ContaFuncionario) => {
    setEditingConta(conta);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConta(null);
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingConta(null);
    loadContas();
  };

  if (authLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className='container-fluid'>
        <HeaderBar onNovaConta={handleNovaConta} />

        <FiltrosCard filtros={filtros} onFiltrosChange={setFiltros} />

        <ResumoCards resumo={resumo} />

        {errorMessage && (
          <div className='alert alert-danger' role='alert'>
            {errorMessage}
          </div>
        )}

        <div className='card border-0 shadow-sm'>
          <div className='card-body'>
            <TabelaContas
              contas={contas}
              loading={listLoading}
              onEdit={handleEditConta}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <ContaModal conta={editingConta} onClose={handleCloseModal} onSaved={handleSaved} />
      )}
    </MainLayout>
  );
}
