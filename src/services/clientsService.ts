import { 
  ClientRecord, 
  CreateClientInput, 
  UpdateClientInput, 
  ClientsListParams,  
} from '@/types/clients';
import { PaginatedResponse, ApiDeleteResponse } from '@/types/index';
import { BaseApiService } from './BaseApiService';

/**
 * Serviço para gerenciamento de clientes
 * Estende BaseApiService para reutilizar funcionalidades comuns
 */
class ClientsService extends BaseApiService {
  /**
   * Lista clientes com parâmetros de filtro
   * @param params - Parâmetros de listagem
   */
  async listClients(params?: ClientsListParams): Promise<PaginatedResponse<ClientRecord>> {
    const response = await this.get<any>('/clients', params);
    return this.normalizePaginatedResponse<ClientRecord>(response);
  }

  /**
   * Obtém cliente por ID
   * @param id - ID do cliente
   */
  async getClient(id: string): Promise<ClientRecord> {
    return this.get<ClientRecord>(`/clients/${id}`);
  }

  /**
   * Cria novo cliente
   * @param payload - Dados do cliente
   */
  async createClient(payload: CreateClientInput): Promise<ClientRecord> {
    return this.post<ClientRecord>('/clients', payload);
  }

  /**
   * Atualiza cliente existente
   * @param id - ID do cliente
   * @param payload - Dados atualizados
   */
  async updateClient(id: string, payload: UpdateClientInput): Promise<ClientRecord> {
    return this.put<ClientRecord>(`/clients/${id}`, payload);
  }

  /**
   * Exclui cliente
   * @param id - ID do cliente
   */
  async deleteClient(id: string): Promise<ApiDeleteResponse> {
    return super.delete<ApiDeleteResponse>(`/clients/${id}`);
  }

  /**
   * Restaura cliente enviado para a lixeira
   * Envia uma requisição PUT para `/admin/clients/{id}` (via base + endpoint `/clients/{id}`)
   * e define `excluido: 'n'` para reativar o registro.
   * @param id - ID do cliente a restaurar
   */
  async restoreClient(id: string): Promise<ClientRecord> {
    // Tipagem flexível para atender à API de restauração
    return this.put<ClientRecord>(`/clients/${id}`, { excluido: 'n' } as any);
  }

  // --- Métodos genéricos para compatibilidade com useGenericApi ---
  /**
   * Lista clientes (wrapper genérico)
   */
  async list(params?: ClientsListParams): Promise<PaginatedResponse<ClientRecord>> {
    return this.listClients(params);
  }

  /**
   * Obtém cliente por ID (wrapper genérico)
   */
  async getById(id: string): Promise<ClientRecord> {
    return this.getClient(id);
  }

  /**
   * Cria cliente (wrapper genérico)
   */
  async create(data: CreateClientInput): Promise<ClientRecord> {
    return this.createClient(data);
  }

  /**
   * Atualiza cliente (wrapper genérico)
   */
  async update(id: string, data: UpdateClientInput): Promise<ClientRecord> {
    return this.updateClient(id, data);
  }

  /**
   * Exclui cliente (wrapper genérico)
   * Retorna a resposta da API para manter compatibilidade com chamadas existentes.
   */
  async delete(id: string): Promise<ApiDeleteResponse> {
    return this.deleteClient(id);
  }
}

export const clientsService = new ClientsService();