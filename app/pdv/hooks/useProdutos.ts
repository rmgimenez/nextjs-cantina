import { useEffect, useState } from 'react';
import type { Produto } from '../types';

/**
 * Hook para gerenciar produtos
 */
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function loadProdutos() {
      try {
        const res = await fetch('/api/produtos?ativo=1');
        const data = await res.json();

        if (data?.data) {
          setProdutos(data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setCarregando(false);
      }
    }

    loadProdutos();
  }, []);

  return { produtos, carregando };
}
