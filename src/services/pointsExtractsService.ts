import { BaseApiService } from './BaseApiService';
import { PointsExtract, PointsExtractFilters, PointsTransactionType } from '@/types/redemptions';
import { ApiResponse, PaginatedResponse } from '@/types/index';

/**
 * Parâmetros para listagem de extratos de pontos
 */
export interface PointsExtractListParams extends PointsExtractFilters {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  export?: boolean | string;
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
  totalBalance: number;
  totalAdjustments: number;
  totalRefunds: number;
}

/**
 * Interface para linha do relatório de saldo por cliente
 */
export interface CustomerPointsBalanceReportItem {
  id: string;
  name: string;
  email: string | null;
  cpf: string | null;
  created_at: string | null;
  saldo_total: number;
}

/**
 * Interface para o resumo do relatório de saldo por cliente
 */
export interface CustomerPointsBalanceReportSummary {
  total_clients: number;
  total_balance: number;
  clients_with_balance: number;
}

/**
 * Interface para a resposta do relatório de saldo por cliente
 */
export interface CustomerPointsBalanceReportResponse extends PaginatedResponse<CustomerPointsBalanceReportItem> {
  summary: CustomerPointsBalanceReportSummary;
}

/**
 * Serviço para gerenciar extratos de pontos
 */
class PointsExtractsService extends BaseApiService {
  private readonly endpoint = '/admin/points-extracts';

  /**
   * Lista todos os extratos de pontos (admin)
   * @param params - Parâmetros de filtro e paginação
   *
   * Nota: não aninhar `params` no objeto; passar plano para evitar
   * `params=[object Object]` na query string.
   */
  async listPointsExtracts(params?: PointsExtractListParams): Promise<PaginatedResponse<PointsExtract>> {
    const response = await this.get<any>(this.endpoint, params);
    return this.normalizePaginatedResponse<PointsExtract>(response);
  }

  /**
   * Obtém um extrato específico por ID
   * @param id - ID do extrato
   * @param adminClientId - ID do cliente (para administradores assumirem a visão do cliente)
   */
  async getPointsExtract(id: string, adminClientId?: string): Promise<PointsExtract> {
    const params = adminClientId ? { admin_client_id: adminClientId } : {};
    const response = await this.get<any>(`${this.endpoint}/${id}`, params);
    return this.mapApiResponseToPointsExtract(response);
  }

  /**
   * Alias para getPointsExtract para manter compatibilidade com componentes
   */
  async getCreditDetails(id: string, adminClientId?: string): Promise<PointsExtract> {
    return this.getPointsExtract(id, adminClientId);
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
      'expiracao': 'expired',
      'expired': 'expired'
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
      balanceBefore: apiData.balanceBefore || 0,
      balanceAfter: apiData.balanceAfter || 0,
      valor_usado: Number(apiData.valor_usado || 0),
      valor_resgatado: Number(apiData.valor_resgatado || 0),
      valor_expirado: Number(apiData.valor_expirado || 0),
      saldo_restante: Number(apiData.saldo_restante || 0),
      is_totalmente_usado: Boolean(apiData.is_totalmente_usado),
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
   *
   * pt-BR: Permite passar os mesmos filtros da listagem para obter
   * estatísticas filtradas (tipo, período, busca, etc.).
   * en-US: Accepts list filters to return filtered stats
   * (type, date range, search, etc.).
   */
  async getPointsExtractStats(params?: PointsExtractListParams): Promise<PointsExtractStats> {
    const response = await this.get<ApiResponse<PointsExtractStats>>(`${this.endpoint}/stats`, params);
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
   * Remove um extrato de pontos
   * @param id - ID do extrato
   */
  async deletePointsExtract(id: string): Promise<ApiResponse<any>> {
    return await this.delete<ApiResponse<any>>(`${this.endpoint}/${id}`);
  }

  /**
   * Exporta extratos de pontos em formato XLSX (Excel) via Backend
   * @param params - Parâmetros de filtro
   * @returns Blob com o arquivo Excel
   */
  async downloadPointsExtractsExcel(params?: PointsExtractListParams): Promise<Blob> {
    const url = this.buildUrlWithParams(`${this.API_BASE_URL}${this.endpoint}/export-xlsx`, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Falha ao exportar Excel: ${response.status}`);
    }
    
    return await response.blob();
  }

  /**
   * Exporta relatório de saldo de clientes em formato XLSX via Backend
   * @param params - Parâmetros de filtro e ordenação
   * @returns Blob com o arquivo Excel
   */
  async downloadCustomerBalancesExcel(params?: any): Promise<Blob> {
    const url = this.buildUrlWithParams(`${this.API_BASE_URL}/admin/points-balances/export-xlsx`, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Falha ao exportar Excel de saldos: ${response.status}`);
    }
    
    return await response.blob();
  }

  async getUserPointsExtracts(userId: string, params?: PointsExtractListParams): Promise<PaginatedResponse<PointsExtract>> {
    const response = await this.get<any>(`/admin/users/${userId}/points-extracts`, params);
    if (response.data && response.data.points && Array.isArray(response.data.points)) {
      response.data.points = response.data.points.map((item: any) => this.mapApiResponseToPointsExtract(item));
    }
    return response;
  }

  /**
   * Obtém extratos de pontos do usuário autenticado
   * @param params - Parâmetros de filtro e paginação
   */
  async getAuthenticatedUserExtract(params?: PointsExtractListParams): Promise<PaginatedResponse<PointsExtract>> {
    const response = await this.get<any>('/user/points/extract', params);
    return this.normalizePaginatedResponse<PointsExtract>(response);
  }

  /**
   * Obtém saldo de pontos e estatísticas do usuário autenticado
   */
  async getAuthenticatedUserBalance(params?: PointsExtractListParams): Promise<{
    total_points: number;
    total_earned: number;
    total_spent: number;
    total_transactions: number;
    active_points: number;
    expired_points: number;
  }> {
    const response = await this.get<ApiResponse<any>>('/user/points/balance', params);
    return response.data;
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
    balance: {
      total_points: string;
      total_earned: string;
      total_spent: string;
      total_transactions: number;
      active_points: string;
      expired_points: number;
    };
  }> {
    const response = await this.get<ApiResponse<any>>(`/admin/users/${userId}/points-balance`);
    return response.data;
  }

  /**
   * Obtém o relatório de saldo total de pontos por cliente.
   */
  async getCustomerBalancesReport(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    order_by?: 'name' | 'email' | 'created_at' | 'saldo_total';
    order?: 'asc' | 'desc';
  }): Promise<CustomerPointsBalanceReportResponse> {
    const response = await this.get<any>('/points/reports/customers', params);
    const normalized = this.normalizePaginatedResponse<CustomerPointsBalanceReportItem>(response);

    return {
      ...normalized,
      data: normalized.data.map((item: any) => ({
        id: String(item.id),
        name: item.name || '',
        email: item.email || null,
        cpf: item.cpf || null,
        created_at: item.created_at || null,
        saldo_total: Number(item.saldo_total || 0),
      })),
      summary: {
        total_clients: Number(response?.summary?.total_clients || 0),
        total_balance: Number(response?.summary?.total_balance || 0),
        clients_with_balance: Number(response?.summary?.clients_with_balance || 0),
      }
    };
  }
}

export const pointsExtractsService = new PointsExtractsService();
