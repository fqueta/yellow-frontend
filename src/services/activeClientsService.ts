import { GenericApiService } from './GenericApiService';
import { PaginatedResponse } from '@/types/index';

// Tipos específicos para clientes ativos
export interface ActiveClientStep1Data {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface ActiveClientStep2Data {
  password: string;
}

export interface ActiveClientCompleteData extends ActiveClientStep1Data {
  password: string;
}

export interface ActiveClientResponse {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: 'pending' | 'active';
  created_at: string;
}

/**
 * Serviço específico para clientes ativos
 * Implementa a interface GenericApiService para compatibilidade com useGenericApi
 */
class ActiveClientsService extends GenericApiService<
  ActiveClientResponse,
  ActiveClientStep1Data,
  ActiveClientCompleteData
> {
  constructor() {
    super('/clients/active');
  }

  /**
   * Primeira etapa: verificação e registro inicial
   */
  async verifyAndRegister(data: ActiveClientStep1Data): Promise<ActiveClientResponse> {
    const response = await this.post<any>(this.endpoint, data);
    return response.data || response;
  }

  /**
   * Segunda etapa: finalização com senha
   */
  async finalizeRegistration(data: ActiveClientCompleteData): Promise<ActiveClientResponse> {
    const response = await this.put<any>(this.endpoint, data);
    return response.data || response;
  }

  // Implementação da interface GenericApiService
  async create(data: ActiveClientStep1Data): Promise<ActiveClientResponse> {
    return this.verifyAndRegister(data);
  }

  async update(id: string, data: ActiveClientCompleteData): Promise<ActiveClientResponse> {
    return this.finalizeRegistration(data);
  }
}

export const activeClientsService = new ActiveClientsService();