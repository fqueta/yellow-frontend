import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRedirect } from '@/hooks/useRedirect';
import { useNavigate } from 'react-router-dom';

interface AuthRedirectProps {
  children: React.ReactNode;
  /**
   * pt-BR: URL de redirecionamento personalizada quando autenticado.
   * en-US: Custom redirect URL when authenticated.
   */
  redirectTo?: string;
}

/**
 * Componente que redireciona usuários autenticados usando a lógica do useRedirect
 * Usado para proteger páginas de login/registro de usuários já logados
 */
export function AuthRedirect({ children, redirectTo }: AuthRedirectProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { redirectAfterAuth } = useRedirect();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * pt-BR: Quando autenticado, redireciona para `redirectTo` se fornecido;
     * caso contrário, aplica a lógica padrão de pós-login.
     * en-US: When authenticated, redirect to `redirectTo` if provided;
     * otherwise apply default post-login logic.
     */
    if (isAuthenticated && !isLoading && user) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        redirectAfterAuth(user);
      }
    }
  }, [isAuthenticated, isLoading, user, redirectAfterAuth, redirectTo, navigate]);

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