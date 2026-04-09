import { PaginatedResponse } from '@/types/index';
import { getTenantIdFromSubdomain, getTenantApiUrl, getVersionApi } from '@/lib/qlib';

/**
 * Classe base para todos os serviços de API
 * Fornece funcionalidades comuns como headers, tratamento de erros e normalização de respostas
 */
export abstract class BaseApiService {
  protected readonly API_BASE_URL: string;
  protected readonly tenant_id: string;
  protected readonly api_version: string;

  constructor() {
    this.tenant_id = getTenantIdFromSubdomain() || 'default';
    this.api_version = getVersionApi();
    this.API_BASE_URL = getTenantApiUrl() + this.api_version;
  }

  /**
   * Obtém os headers padrão para requisições
   */
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Trata a resposta da API e converte para JSON
   * @param response - Resposta da requisição fetch
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      let errorBody: any = null;
      try {
        errorBody = await response.json();
        errorMessage = errorBody?.message || errorBody?.error || errorMessage;
      } catch {
        // ignore json parse errors
      }
      
      // Criar erro com status code para verificação de acesso
      const error = new Error(errorMessage) as Error & { status?: number; body?: any };
      error.status = response.status;
      error.body = errorBody;
      
      throw error;
    }
    return response.json();
  }

  /**
   * Constrói URL com parâmetros de query
   * @param baseUrl - URL base
   * @param params - Parâmetros de query
   */
  protected buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Normaliza resposta paginada para o formato esperado
   * @param response - Resposta da API
   */
  protected normalizePaginatedResponse<T>(response: any): PaginatedResponse<T> {
    // Se já está no formato correto, retorna como está
    if (response.data && Array.isArray(response.data) && (response.current_page || response.pagination)) {
       const pagination = response.pagination || {};
        const normalized: PaginatedResponse<T> = {
          data: response.data,
          current_page: Number(pagination.current_page || response.current_page || 1),
          last_page: Number(pagination.last_page || response.last_page || 1),
          per_page: Number(pagination.per_page || response.per_page || response.data.length),
          total: Number(pagination.total || response.total || response.data.length),
          global_stats: response.global_stats // Preserva estatísticas globais se existirem
        };
       return normalized;
    }

    // Se é um array direto, converte para formato paginado
    if (Array.isArray(response)) {
      return {
        data: response,
        current_page: 1,
        last_page: 1,
        per_page: response.length,
        total: response.length
      };
    }

    // Fallback para outros formatos
    // Se response.data.data for um array, é o formato duplamente aninhado do admin/redemptions
    const isDoubleNested = response?.data && Array.isArray(response.data.data);
    const data = isDoubleNested ? response.data.data : (response?.items || response?.data || []);
    const source = isDoubleNested ? response.data : response;
    const pagination = response?.pagination || {};
    
    const normalizedFallback: PaginatedResponse<T> = {
      data: Array.isArray(data) ? data : [],
      current_page: Number(pagination.current_page || source?.current_page || source?.page || 1),
      last_page: Number(pagination.last_page || source?.last_page || source?.total_pages || 1),
      per_page: Number(pagination.per_page || source?.per_page || source?.limit || 10),
      total: Number(pagination.total || source?.total || source?.count || 0),
      global_stats: response.global_stats || source?.global_stats // Preserva estatísticas no fallback
    };
    return normalizedFallback;
  }

  /**
   * Executa requisição GET
   * @param endpoint - Endpoint da API
   * @param params - Parâmetros de query
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrlWithParams(`${this.API_BASE_URL}${endpoint}`, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Executa requisição POST
   * @param endpoint - Endpoint da API
   * @param data - Dados para envio
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Executa requisição PUT
   * @param endpoint - Endpoint da API
   * @param data - Dados para envio
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Executa requisição PATCH
   * @param endpoint - Endpoint da API
   * @param data - Dados para enviar no corpo da requisição
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Executa requisição DELETE
   * @param endpoint - Endpoint da API
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}