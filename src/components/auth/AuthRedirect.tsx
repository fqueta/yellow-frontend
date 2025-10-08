import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que redireciona usuários autenticados para uma página específica
 * Usado para proteger páginas de login/registro de usuários já logados
 */
export function AuthRedirect({ children, redirectTo = '/admin' }: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário está autenticado e não está carregando, redireciona
    if (isAuthenticated && !isLoading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  // Se está carregando, não renderiza nada (ou pode mostrar um loading)
  if (isLoading) {
    return null;
  }

  // Se está autenticado, não renderiza o conteúdo (será redirecionado)
  if (isAuthenticated) {
    return null;
  }

  // Se não está autenticado, renderiza o conteúdo normalmente
  return <>{children}</>;
}