import { Redemption, RedemptionFilters } from '@/types/redemptions';
import { redemptionsService, RedemptionListParams } from '@/services/redemptionsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook para listar resgates do usuário logado
 */
export function useUserRedemptions(params?: RedemptionListParams, queryOptions?: any) {
  return useQuery({
    queryKey: ['user-redemptions', params],
    queryFn: () => redemptionsService.listUserRedemptions(params),
    ...queryOptions
  });
}

/**
 * Hook para obter um resgate específico
 */
export function useRedemption(id: string, queryOptions?: any) {
  return useQuery({
    queryKey: ['redemption', id],
    queryFn: () => redemptionsService.getRedemption(id),
    enabled: !!id,
    ...queryOptions
  });
}

/**
 * Hook para listar todos os resgates (admin)
 */
export function useAllRedemptions(params?: RedemptionListParams, queryOptions?: any) {
  return useQuery({
    queryKey: ['all-redemptions', params],
    queryFn: () => redemptionsService.listAllRedemptions(params),
    ...queryOptions
  });
}

/**
 * Hook para atualizar status de resgate (admin)
 */
export function useUpdateRedemptionStatus(mutationOptions?: any) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes, trackingCode }: { id: string; status: string; notes?: string; trackingCode?: string }) => 
      redemptionsService.updateRedemptionStatus(id, status, notes, trackingCode),
    onSuccess: (data, variables) => {
      // Invalidar cache de resgates para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['all-redemptions'] });
      // Invalidar também a query específica do resgate atualizado
      queryClient.invalidateQueries({ queryKey: ['redemption', variables.id] });
      // Forçar refetch das queries ativas
      queryClient.refetchQueries({ queryKey: ['all-redemptions'] });
    },
    ...mutationOptions
  });
}

/**
 * Hook para extornar um resgate (admin)
 * Envia o ID do resgate para API e atualiza caches relacionados
 */
export function useRefundRedemption(mutationOptions?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => redemptionsService.refundRedemption(id, notes),
    onSuccess: (data, variables) => {
      // Invalidar caches para refletir o extorno
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['all-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemption', variables.id] });
      queryClient.refetchQueries({ queryKey: ['all-redemptions'] });
    },
    ...mutationOptions,
  });
}

/**
 * Hook para excluir um resgate (admin)
 * Executa DELETE e invalida caches relacionados.
 */
export function useDeleteRedemption(mutationOptions?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => redemptionsService.deleteRedemption(id),
    /**
     * Ao excluir um resgate:
     * - Remove o item dos caches das listagens de forma otimista (evita reaparecer ao voltar para a lista)
     * - Invalida as queries para garantir sincronização com o servidor
     * - Remove o cache do detalhe específico
     * - Opcionalmente força refetch das listagens ativas
     */
    onSuccess: (_data, id) => {
      // Remover otimisticamente o item das listagens em cache
      queryClient.setQueriesData({ queryKey: ['all-redemptions'] }, (oldData: any) => {
        if (!oldData) return oldData;
        try {
          const next = { ...oldData };
          if (Array.isArray(next.data)) {
            next.data = next.data.filter((r: any) => String(r?.id) !== String(id));
            if (typeof next.total === 'number') {
              next.total = Math.max(0, next.total - 1);
            }
          }
          return next;
        } catch {
          return oldData;
        }
      });
      queryClient.setQueriesData({ queryKey: ['user-redemptions'] }, (oldData: any) => {
        if (!oldData) return oldData;
        try {
          const next = { ...oldData };
          if (Array.isArray(next.data)) {
            next.data = next.data.filter((r: any) => String(r?.id) !== String(id));
            if (typeof next.total === 'number') {
              next.total = Math.max(0, next.total - 1);
            }
          }
          return next;
        } catch {
          return oldData;
        }
      });

      // Invalida e remove caches relacionados
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['all-redemptions'] });
      queryClient.removeQueries({ queryKey: ['redemption', id] });

      // Garante atualização imediata das listagens ativas
      queryClient.refetchQueries({ queryKey: ['all-redemptions'] });
      queryClient.refetchQueries({ queryKey: ['user-redemptions'] });

      mutationOptions?.onSuccess?.(_data, id, undefined);
    },
    onError: (error: Error) => {
      mutationOptions?.onError?.(error, undefined as any, undefined);
    },
    ...mutationOptions,
  });
}