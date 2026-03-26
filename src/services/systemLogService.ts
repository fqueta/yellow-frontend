import { BaseApiService } from './BaseApiService';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface SystemLog {
  id: number;
  tenant_id: string | null;
  event_type: string;
  status: 'success' | 'warning' | 'error' | 'info';
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

interface FetchLogsParams {
  page?: number;
  per_page?: number;
  event_type?: string;
  status?: string;
}

class SystemLogService extends BaseApiService {
  private readonly endpoint = '/system-logs';

  /**
   * Busca os logs do sistema
   */
  async getLogs(params: FetchLogsParams = {}): Promise<PaginatedResponse<SystemLog>> {
    // Build query string
    const queryParts = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.per_page) queryParts.push(`per_page=${params.per_page}`);
    if (params.event_type) queryParts.push(`event_type=${params.event_type}`);
    if (params.status) queryParts.push(`status=${params.status}`);
    
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    
    const response = await this.get<ApiResponse<PaginatedResponse<SystemLog>>>(`${this.endpoint}${queryString}`);
    
    return response.data;
  }
}

export const systemLogService = new SystemLogService();
