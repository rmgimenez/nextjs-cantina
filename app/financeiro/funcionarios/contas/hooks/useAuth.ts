import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '../types';

/**
 * Hook para verificar autenticação do usuário
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  return { user, loading };
}
