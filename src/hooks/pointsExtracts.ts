import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  pointsExtractsService, 
  PointsExtractListParams, 
  CreateAdjustmentRequest,
  PointsExtractStats,
  CustomerPointsBalanceReportResponse
} from '@/services/pointsExtractsService';
import { PointsExtract } from '@/types/redemptions';
import { PaginatedResponse } from '@/types/index';

/**
 * Hook para listar extratos de pontos (admin)
 */
export function usePointsExtracts(params?: PointsExtractListParams, queryOptions?: any) {
  return useQuery<PaginatedResponse<PointsExtract>>({
    queryKey: ['points-extracts', params],
    queryFn: () => pointsExtractsService.listPointsExtracts(params),
    ...queryOptions
  });
}

/**
 * Hook para listar extratos de pontos (admin) com scroll infinito
 */
export function useInfinitePointsExtracts(params?: PointsExtractListParams, queryOptions?: any) {
  return useInfiniteQuery<PaginatedResponse<PointsExtract>>({
    queryKey: ['infinite-points-extracts', params],
    queryFn: ({ pageParam = 1 }) =>
      pointsExtractsService.listPointsExtracts({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    ...queryOptions
  });
}

/**
 * Hook para obter um extrato específico
 */
export function usePointsExtract(id: string, queryOptions?: any) {
  return useQuery<PointsExtract>({
    queryKey: ['points-extract', id],
    queryFn: () => pointsExtractsService.getPointsExtract(id),
    enabled: !!id,
    ...queryOptions
  });
}

/**
 * Hook para obter estatísticas dos extratos
 *
 * pt-BR: Aceita filtros (mesmos da listagem) para que os cards
 * reflitam os resultados filtrados.
 * en-US: Accepts filters (same as list) so the stats cards
 * reflect the filtered results.
 */
export function usePointsExtractStats(params?: PointsExtractListParams, queryOptions?: any) {
  return useQuery<PointsExtractStats>({
    queryKey: ['points-extracts-stats', params],
    queryFn: () => pointsExtractsService.getPointsExtractStats(params),
    ...queryOptions
  });
}

/**
 * Hook para criar ajuste manual de pontos
 */
export function useCreateAdjustment(mutationOptions?: any) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAdjustmentRequest) => 
      pointsExtractsService.createAdjustment(data),
    onSuccess: () => {
      // Invalidar cache de extratos para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['points-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-points-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['points-extracts-stats'] });
      // Invalidar também cache de usuários se existir
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    ...mutationOptions
  });
}

/**
 * Hook para excluir um extrato de pontos
 */
export function useDeletePointsExtract(mutationOptions?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pointsExtractsService.deletePointsExtract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-points-extracts'] });
      queryClient.invalidateQueries({ queryKey: ['points-extracts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    ...mutationOptions
  });
}

/**
 * Hook para exportar extratos de pontos
 */
export function useExportPointsExtracts(mutationOptions?: any) {
  return useMutation({
    mutationFn: (params?: PointsExtractListParams) => 
      pointsExtractsService.downloadPointsExtractsExcel(params),
    ...mutationOptions
  });
}

/**
 * Hook para obter extratos de um usuário específico
 */
export function useUserPointsExtracts(userId: string, params?: PointsExtractListParams, queryOptions?: any) {
  return useQuery<PaginatedResponse<PointsExtract>>({
    queryKey: ['user-points-extracts', userId, params],
    queryFn: () => pointsExtractsService.getUserPointsExtracts(userId, params),
    enabled: !!userId,
    ...queryOptions
  });
}

/**
 * Hook para obter saldo de pontos de um usuário
 */
export function useUserPointsBalance(userId: string, queryOptions?: any) {
  return useQuery<{
    user: {
      id: string;
      name: string;
      email: string;
      cpf: string;
    };
    stats: {
      total_points: string;
      total_earned: string;
      total_spent: string;
      total_transactions: number;
      active_points: string;
      expired_points: number;
    };
  }>({
    queryKey: ['user-points-balance', userId],
    queryFn: () => pointsExtractsService.getUserPointsBalance(userId),
    enabled: !!userId,
    ...queryOptions
  });
}

/**
 * Hook para obter extratos de pontos do usuário autenticado
 */
export function useAuthenticatedUserPointsExtracts(params?: PointsExtractListParams, queryOptions?: any) {
  return useQuery<PaginatedResponse<PointsExtract>>({
    queryKey: ['authenticated-user-points-extracts', params],
    queryFn: () => pointsExtractsService.getAuthenticatedUserExtract(params),
    ...queryOptions
  });
}

/**
 * Hook para obter saldo de pontos do usuário autenticado
 */
export function useAuthenticatedUserPointsBalance(params?: PointsExtractListParams, queryOptions?: any) {
  return useQuery<{
    total_points: number;
    total_earned: number;
    total_spent: number;
    total_transactions: number;
    active_points: number;
    expired_points: number;
    points_expiring_soon: number;
  }>({
    queryKey: ['authenticated-user-points-balance', params],
    queryFn: () => pointsExtractsService.getAuthenticatedUserBalance(params),
    ...queryOptions
  });
}

/**
 * Hook para obter extratos de pontos do usuário autenticado com paginação infinita
 */
export function useAuthenticatedUserInfinitePointsExtracts(params?: PointsExtractListParams, queryOptions?: any) {
  return useInfiniteQuery<PaginatedResponse<PointsExtract>>({
    queryKey: ['authenticated-user-points-extracts-infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      pointsExtractsService.getAuthenticatedUserExtract({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    ...queryOptions
  });
}

/**
 * Hook para obter o relatório de saldo total por cliente.
 */
export function useCustomerPointsBalancesReport(
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
    order_by?: 'name' | 'email' | 'created_at' | 'saldo_total';
    order?: 'asc' | 'desc';
  },
  queryOptions?: any
) {
  return useQuery<CustomerPointsBalanceReportResponse>({
    queryKey: ['customer-points-balances-report', params],
    queryFn: () => pointsExtractsService.getCustomerBalancesReport(params),
    ...queryOptions
  });
}
