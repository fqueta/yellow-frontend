import { BaseApiService } from './BaseApiService';
import { PointsExtract, PointsExtractFilters } from '@/types/redemptions';
import { ApiResponse, PaginatedResponse } from '@/types/index';
import { link } from 'fs';

/**
 * Parâmetros para listagem de extratos de pontos
 */
export interface PointsExtractListParams extends PointsExtractFilters {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Interface para criação de ajuste manual
 */
export interface CreateAdjustmentRequest {
  user_id: string;
  points: number;
  description: string;
  reason?: string;
}

/**
 * Interface para estatísticas de extratos
 */
export interface PointsExtractStats {
  totalTransactions: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  activeUsers: number;
  totalAdjustments: number;
  totalRefunds: number;
}

/**
 * Serviço para gerenciar extratos de pontos
 */
class PointsExtractsService extends BaseApiService {
  private readonly endpoint = '/admin/points-extracts';

  /**
   * Lista todos os extratos de pontos (admin)
   * @param params - Parâmetros de filtro e paginação
   */
  async listPointsExtracts(params?: PointsExtractListParams): Promise<PaginatedResponse<PointsExtract>> {
    const response = await this.get<any>(this.endpoint, { params });
    
    // Mapear os dados se necessário
    // if (response.data && Array.isArray(response.data)) {;
      
    //   response.data = response.data.map((item: any) => this.mapApiResponseToPointsExtract(item));
    // }
    // console.log('d', response);
    return response;
  }

  /**
   * Obtém um extrato específico por ID
   * @param id - ID do extrato
   */
  async getPointsExtract(id: string): Promise<PointsExtract> {
    const response = await this.get<any>(`${this.endpoint}/${id}`);
    return this.mapApiResponseToPointsExtract(response);
  }

  /**
   * Mapeia a resposta da API para a interface PointsExtract
   * @param apiData - Dados da API
   */
  private mapApiResponseToPointsExtract(apiData: any): PointsExtract {
    // Mapear tipo de transação
    const typeMapping: { [key: string]: PointsTransactionType } = {
      'credito': 'earned',
      'debito': 'redeemed',
      'bonus': 'bonus',
      'ajuste': 'adjustment',
      'reembolso': 'refund',
      'expiracao': 'expired'
    };

    // Calcular pontos considerando o tipo de transação
    const valorNumerico = parseFloat(apiData.valor || '0');
    const tipo = apiData.tipo || '';
    let points = valorNumerico;
    
    // Para débitos, manter valor negativo
    if (tipo === 'debito' || tipo === 'expiracao') {
      points = -Math.abs(valorNumerico);
    } else {
      points = Math.abs(valorNumerico);
    }

    return {
      id: apiData.id?.toString() || '',
      userId: apiData.client_id || apiData.usuario_id || '',
      userName: apiData.cliente?.name || apiData.usuario?.name || '',
      userEmail: apiData.cliente?.email || apiData.usuario?.email || '',
      type: typeMapping[apiData.tipo] || 'adjustment',
      points: points,
      description: apiData.description || '',
      reference: apiData.pedido_id || undefined,
      balanceBefore: 0, // Será calculado ou obtido de outra fonte
      balanceAfter: 0,  // Será calculado ou obtido de outra fonte
      expirationDate: apiData.data_expiracao || undefined,
      createdAt: apiData.created_at || apiData.data || '',
      createdBy: undefined,
      // Manter campos originais da API para compatibilidade
      client_id: apiData.client_id,
      valor: apiData.valor,
      data: apiData.data,
      tipo: apiData.tipo,
      origem: apiData.origem,
      valor_referencia: apiData.valor_referencia,
      data_expiracao: apiData.data_expiracao,
      status: apiData.status,
      usuario_id: apiData.usuario_id,
      pedido_id: apiData.pedido_id,
      config: apiData.config,
      ativo: apiData.ativo,
      updated_at: apiData.updated_at,
      deleted_at: apiData.deleted_at,
      cliente: apiData.cliente,
      usuario: apiData.usuario
    };
  }

  /**
   * Obtém estatísticas dos extratos de pontos
   */
  async getPointsExtractStats(): Promise<PointsExtractStats> {
    const response = await this.get<ApiResponse<PointsExtractStats>>(`${this.endpoint}/stats`);
    return response.data;
  }

  /**
   * Cria um ajuste manual de pontos
   * @param data - Dados do ajuste
   */
  async createAdjustment(data: CreateAdjustmentRequest): Promise<PointsExtract> {
    const response = await this.post<ApiResponse<PointsExtract>>(`${this.endpoint}/adjustments`, data);
    return response.data;
  }

  /**
   * Exporta extratos de pontos
   * @param params - Parâmetros de filtro
   */
  async exportPointsExtracts(params?: PointsExtractListParams): Promise<Blob> {
    const response = await this.get(`${this.endpoint}/export`, { 
      params,
      responseType: 'blob'
    });
    return response as Blob;
  }

  /**
   * Obtém extratos de pontos de um usuário específico
   * @param userId - ID do usuário
   * @param params - Parâmetros de filtro e paginação
   */
  async getUserPointsExtracts(userId: string, params?: PointsExtractListParams): Promise<PaginatedResponse<PointsExtract>> {
    const response = await this.get<any>(`/admin/users/${userId}/points-extracts`, { params });
    
    // Mapear os dados se necessário - os pontos estão em response.data.points
    if (response.data && response.data.points && Array.isArray(response.data.points)) {
      response.data.points = response.data.points.map((item: any) => this.mapApiResponseToPointsExtract(item));
    }
    
    return response;
  }

  /**
   * Obtém saldo de pontos de um usuário
   * @param userId - ID do usuário
   */
  async getUserPointsBalance(userId: string): Promise<{
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
  }> {
    const link = `/admin/users/${userId}/points-extracts`;
    const response = await this.get<ApiResponse<any>>(link);
    return {
      user: response.data.user,
      stats: response.data.stats
    };
  }
}

export const pointsExtractsService = new PointsExtractsService();