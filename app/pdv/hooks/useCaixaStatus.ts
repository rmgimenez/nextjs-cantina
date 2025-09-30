import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { StatusCaixa, User } from '../types';

/**
 * Hook para gerenciar o status do caixa
 */
export function useCaixaStatus(user: User | null) {
  const router = useRouter();
  const [statusCaixa, setStatusCaixa] = useState<StatusCaixa | null>(null);

  useEffect(() => {
    async function loadStatus() {
      if (!user) return;

      try {
        const r = await fetch('/api/caixa/status');
        if (r.status === 401) return;

        const d = await r.json();
        const st = d?.data || { aberto: false };
        setStatusCaixa(st);

        if (!st.aberto) {
          router.push('/caixa');
        }
      } catch (error) {
        console.error('Erro ao carregar status do caixa:', error);
      }
    }

    loadStatus();
  }, [user, router]);

  return { statusCaixa };
}
