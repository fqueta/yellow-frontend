import { ClientRecord, CreateClientInput, UpdateClientInput, ClientsListParams } from '@/types/clients';
import { clientsService } from '@/services/clientsService';
import { useGenericApi } from './useGenericApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Função para obter os hooks de clientes
 * Fornece CRUD e utilitários com base em React Query
 */
function getClientsApi() {
  return useGenericApi<ClientRecord, CreateClientInput, UpdateClientInput, ClientsListParams>({
    service: clientsService,
    queryKey: 'clients',
    entityName: 'Cliente'
  });
}

// Exporta os hooks individuais para manter compatibilidade
export function useClientsList(params?: ClientsListParams, queryOptions?: any) {
  const api = getClientsApi();
  return api.useList(params, queryOptions);
}

export function useClient(id: string, queryOptions?: any) {
  const api = getClientsApi();
  return api.useGetById(id, queryOptions);
}

export function useClientById(id: string, queryOptions?: any) {
  const api = getClientsApi();
  return api.useGetById(id, queryOptions);
}

export function useCreateClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useCreate(mutationOptions);
}

export function useUpdateClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useUpdate(mutationOptions);
}

export function useDeleteClient(mutationOptions?: any) {
  const api = getClientsApi();
  return api.useDelete(mutationOptions);
}

/**
 * Hook para restaurar cliente da lixeira
 * Envia PUT para `/admin/clients/{id}` (endpoint base `/clients/{id}`)
 * Invalida o cache da lista de clientes e exibe toast de sucesso/erro.
 */
export function useRestoreClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.restoreClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente restaurado',
        description: 'O cliente foi restaurado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao restaurar',
        description: error?.message || 'Falha ao restaurar o cliente.',
        variant: 'destructive',
      });
    },
  });
}

// Exporta função para uso avançado
export const useClientsApi = getClientsApi;