import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchSystemStatus } from '@/services/systemStatusService';

interface SystemMaintenanceBannerProps {
  compact?: boolean;
}

/**
 * Exibe um aviso visual quando o sistema estiver em modo de manutenção.
 */
export function SystemMaintenanceBanner({ compact = false }: SystemMaintenanceBannerProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /**
     * Busca o status público e atualiza o banner apenas quando necessário.
     */
    const loadSystemStatus = async () => {
      try {
        const status = await fetchSystemStatus();

        if (cancelled) {
          return;
        }

        setIsMaintenanceMode(status.maintenance_mode_admin_only);
        setMessage(status.message ?? null);
      } catch {
        if (!cancelled) {
          setIsMaintenanceMode(false);
          setMessage(null);
        }
      }
    };

    void loadSystemStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isMaintenanceMode) {
    return null;
  }

  return (
    <Alert className={compact ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm'}>
      <ShieldAlert className="h-4 w-4 !text-amber-700" />
      <AlertTitle>Modo de Manutenção Ativo</AlertTitle>
      <AlertDescription>
        {message || 'O sistema está em manutenção e o acesso está temporariamente restrito ao administrador principal.'}
      </AlertDescription>
    </Alert>
  );
}
