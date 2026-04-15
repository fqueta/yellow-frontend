import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRedirect } from '@/hooks/useRedirect';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { fetchSystemStatus } from '@/services/systemStatusService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { createLoginUrl } = useRedirect();
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const [maintenanceBlocked, setMaintenanceBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkMaintenanceStatus = async () => {
      if (!isAuthenticated || !user) {
        if (!cancelled) {
          setMaintenanceBlocked(false);
          setIsCheckingMaintenance(false);
        }
        return;
      }

      try {
        const status = await fetchSystemStatus();
        const mustBlock = status.maintenance_mode_admin_only && Number(user.permission_id || 0) > 1;

        if (cancelled) {
          return;
        }

        if (mustBlock) {
          authService.clearStorage();
          setMaintenanceBlocked(true);
          toast({
            title: "Sistema em manutenção",
            description: status.message || 'Acesso temporariamente restrito ao administrador principal.',
            variant: "destructive",
          });
        } else {
          setMaintenanceBlocked(false);
        }
      } catch {
        if (!cancelled) {
          setMaintenanceBlocked(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingMaintenance(false);
        }
      }
    };

    const handleWindowFocus = () => {
      void checkMaintenanceStatus();
    };

    setIsCheckingMaintenance(true);
    void checkMaintenanceStatus();
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAuthenticated, user]);

  if (isLoading || isCheckingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || maintenanceBlocked) {
    // Salvar a rota atual para redirecionamento após login
    // Preserva a URL completa incluindo query parameters e hash
    const loginUrl = createLoginUrl();
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
