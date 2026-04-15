import { getTenantApiUrl, getVersionApi } from '@/lib/qlib';

export interface SystemStatus {
  maintenance_mode_admin_only: boolean;
  message?: string | null;
}

/**
 * Busca o status público do sistema (sem auth) para decisões de UI.
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const url = `${getTenantApiUrl()}${getVersionApi()}/system/status`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Falha em status não deve derrubar o app; tratar como "sem manutenção".
    return { maintenance_mode_admin_only: false };
  }

  const data = await response.json();
  return {
    maintenance_mode_admin_only: Boolean(data?.maintenance_mode_admin_only),
    message: data?.message ?? null,
  };
}

