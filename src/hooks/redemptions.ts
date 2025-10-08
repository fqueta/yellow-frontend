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