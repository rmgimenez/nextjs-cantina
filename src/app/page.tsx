import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona para o dashboard por padrão
  redirect('/dashboard');
}
