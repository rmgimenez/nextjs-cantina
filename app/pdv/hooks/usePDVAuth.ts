import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '../types';

/**
 * Hook para gerenciar autenticação no PDV
 */
export function usePDVAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.authenticated) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setCarregando(false);
      }
    }

    checkAuth();
  }, [router]);

  return { user, carregando };
}
