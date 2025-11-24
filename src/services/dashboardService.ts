import { BaseApiService } from './BaseApiService';

/**
 * Interface para atividades recentes de clientes
 */
export interface ClientActivity {
  id: string;
  name: string;
  email: string | null;
  status: string;
  type: string;
  title: string;
  created_at: string;
  // Campos computados para compatibilidade
  client?: string;
  time?: string;
  cpf?: string;
  cnpj?: string;
}

/**
 * Interface para dados de cadastro de clientes por período
 */
export interface ClientRegistrationData {
  date: string;
  actived: number;
  inactived: number;
  pre_registred: number;
}

/**
 * Interface para pré-registros pendentes
 */
export interface PendingPreRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  type: string;
}

/**
 * Interface para resposta da API do dashboard
 */
export interface DashboardApiResponse {
  success: boolean;
  data: {
    recentClientActivities: ClientActivity[];
    registration_data: ClientRegistrationData[];
    pendingPreRegistrations: PendingPreRegistration[];
    totals: {
      actived: number;
      inactived: number;
      pre_registred: number;
      variation_percentage: number;
    };
  };
}

/**
 * Interface para dados do dashboard
 */
export interface DashboardData {
  recentActivities: ClientActivity[];
  registrationData: ClientRegistrationData[];
  pendingPreRegistrations: PendingPreRegistration[];
  totals?: {
    actived: number;
    inactived: number;
    pre_registred: number;
    variation_percentage: number;
  };
}

/**
 * Serviço para dados do dashboard
 * Fornece endpoints para atividades recentes, dados de cadastro e pré-registros
 */
class DashboardService extends BaseApiService {
  private readonly endpoint = '/dashboard';

  /**
   * Obtém atividades recentes de clientes
   * @param limit - Número máximo de atividades a retornar
   * @param startDate - Data inicial do filtro (yyyy-mm-dd)
   * @param endDate - Data final do filtro (yyyy-mm-dd)
   */
  async getRecentActivities(limit: number = 10, startDate?: string, endDate?: string): Promise<ClientActivity[]> {
    try {
      const response = await this.get<DashboardApiResponse>(this.endpoint, {
        limit,
        start_date: startDate,
        end_date: endDate,
      });
      // Aceita diferentes chaves que o backend pode retornar
      const recentApi = (response as any)?.data?.recent_activities
        || (response as any)?.data?.recentClientActivities
        || (response as any)?.data?.recent_client_activities;
      if (response.success && Array.isArray(recentApi)) {
        return this.transformActivities(recentApi.slice(0, limit));
      }
      console.log('recentClientActivities:', response.data);
      return this.getMockRecentActivities();
    } catch (error) {
      // Se for erro 403, propagar o erro para o componente
      if ((error as any)?.status === 403) {
        throw error;
      }
      console.warn('Erro ao buscar atividades recentes, usando dados mock:', error);
      return this.getMockRecentActivities();
    }
  }

  /**
   * Obtém dados de cadastro de clientes por período
   * @param startDate - Data de início
   * @param endDate - Data de fim
   */
  async getRegistrationData(startDate?: string, endDate?: string): Promise<ClientRegistrationData[]> {
    try {
      /**
       * getRegistrationData
       * pt-BR: Busca dados de cadastro por período. Remove `limit` (não definido)
       *        para evitar erro e queda no fallback de zeros.
       * en-US: Fetches registration data by period. Removes undefined `limit`
       *        to prevent error and zero-series fallback.
       */
      const response = await this.get<DashboardApiResponse>(this.endpoint, {
        start_date: startDate,
        end_date: endDate,
      });
      // console.log('clientRegistrationData.....:', response.data);
      const regApi = (response as any)?.data?.registration_data
        || (response as any)?.data?.clientRegistrationData
        || (response as any)?.data?.registrations;
      if (response.success && Array.isArray(regApi)) {
        return regApi;
      }
      // Fallback: retorna série de 14 dias com zeros para manter o gráfico visível
      return this.generateZeroSeries(startDate, endDate);
    } catch (error) {
      // Se for erro 403, propagar o erro para o componente
      if ((error as any)?.status === 403) {
        throw error;
      }
      console.warn('Erro ao buscar dados de cadastro, usando dados mock:', error);
      // Fallback em erro: 14 dias com zeros
      return this.generateZeroSeries(startDate, endDate);
    }
  }

  /**
   * Obtém pré-registros pendentes
   * @param limit - Número máximo de pré-registros a retornar
   */
  async getPendingPreRegistrations(limit: number = 10, startDate?: string, endDate?: string): Promise<PendingPreRegistration[]> {
    /**
     * Obtém pré-registros pendentes com filtro opcional por período
     * pt-BR: Aceita `startDate` e `endDate` (yyyy-mm-dd) para refletir o filtro na requisição.
     * en-US: Accepts `startDate` and `endDate` (yyyy-mm-dd) to reflect filters in the request.
     */
    try {
      const response = await this.get<DashboardApiResponse>(this.endpoint, {
        start_date: startDate,
        end_date: endDate,
      });
      console.log('pendingPreRegistrations:', response.data);
      if (response.success && response.data?.pending_pre_registrations) {
        return response.data.pending_pre_registrations.slice(0, limit);
      }
      return this.getMockPendingPreRegistrations();
    } catch (error) {
      // Se for erro 403, propagar o erro para o componente
      if ((error as any)?.status === 403) {
        throw error;
      }
      console.warn('Erro ao buscar pré-registros pendentes, usando dados mock:', error);
      return this.getMockPendingPreRegistrations();
    }
  }

  /**
   * Obtém todos os dados do dashboard
   */
  async getDashboardData(startDate?: string, endDate?: string): Promise<DashboardData> {
    try {
      const response = await this.get<DashboardApiResponse>(this.endpoint, {
        start_date: startDate,
        end_date: endDate,
      });
      if (response.success && response.data) {
        return {
          recentActivities: this.transformActivities((response as any)?.data?.recentClientActivities || (response as any)?.data?.recent_activities || []),
          registrationData: (response as any)?.data?.clientRegistrationData || (response as any)?.data?.registration_data || [],
          pendingPreRegistrations: (response as any)?.data?.pendingPreRegistrations || (response as any)?.data?.pending_pre_registrations || [],
          totals: response.data.totals
        };
      }
      return this.getMockDashboardData();
    } catch (error) {
      console.warn('Erro ao buscar dados do dashboard, usando dados mock:', error);
      return this.getMockDashboardData();
    }
  }

  /**
   * Transforma atividades da API para o formato esperado pelo componente
   */
  private transformActivities(activities: ClientActivity[]): ClientActivity[] {
    return activities.map(activity => ({
      ...activity,
      client: activity.name,
      time: this.formatTimeAgo(activity.created_at),
      // Extrai CPF/CNPJ do nome se disponível
      cpf: this.extractCpfFromName(activity.name),
      cnpj: this.extractCnpjFromName(activity.name)
    }));
  }

  /**
   * Formata data para "tempo atrás"
   */
  private formatTimeAgo(dateString: string): string {
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
      } else if (diffHours > 0) {
        return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
      } else {
        return 'Agora mesmo';
      }
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Extrai CPF do nome se presente
   */
  private extractCpfFromName(name: string): string | undefined {
    const cpfMatch = name.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    return cpfMatch ? cpfMatch[0] : undefined;
  }

  /**
   * Extrai CNPJ do nome se presente
   */
  private extractCnpjFromName(name: string): string | undefined {
    const cnpjMatch = name.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    return cnpjMatch ? cnpjMatch[0] : undefined;
  }

  /**
   * Dados mock para atividades recentes
   */
  private getMockRecentActivities(): ClientActivity[] {
    return [
      {
        id: 1,
        type: "client_registered",
        title: "Novo cliente cadastrado",
        client: "João Silva",
        status: "actived",
        time: "2 horas atrás",
        cpf: "123.456.789-00",
      },
      {
        id: 2,
        type: "client_pre_registered",
        title: "Pré-cadastro realizado",
        client: "Maria Santos",
        status: "pre_registred",
        time: "4 horas atrás",
        cpf: "987.654.321-00",
      },
      {
        id: 3,
        type: "client_activated",
        title: "Cliente ativado",
        client: "Empresa ABC Ltda",
        status: "actived",
        time: "1 dia atrás",
        cnpj: "12.345.678/0001-90",
      },
      {
        id: 4,
        type: "client_inactivated",
        title: "Cliente inativado",
        client: "Pedro Costa",
        status: "inactived",
        time: "2 dias atrás",
        cpf: "456.789.123-00",
      },
    ];
  }

  /**
   * Dados mock para cadastros por período
   */
  private getMockRegistrationData(): ClientRegistrationData[] {
    return [
      { date: "2025-09-16", actived: 1, inactived: 0, pre_registred: 0 },
      { date: "2025-09-17", actived: 1, inactived: 0, pre_registred: 0 },
      { date: "2025-09-18", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-19", actived: 0, inactived: 1, pre_registred: 0 },
      { date: "2025-09-20", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-21", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-22", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-23", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-24", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-25", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-26", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-27", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-28", actived: 0, inactived: 0, pre_registred: 0 },
      { date: "2025-09-29", actived: 3, inactived: 0, pre_registred: 0 },
    ];
  }

  /**
   * generateZeroSeries
   * pt-BR: Gera uma série contínua de datas com valores zero,
   *        cobrindo o intervalo informado ou, se ausente, os últimos 14 dias.
   * en-US: Generates a continuous date series with zero values,
   *        covering the provided range or, if missing, the last 14 days.
   */
  private generateZeroSeries(startDate?: string, endDate?: string): ClientRegistrationData[] {
    const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      const [sy, sm, sd] = startDate.split('-').map(Number);
      const [ey, em, ed] = endDate.split('-').map(Number);
      start = new Date(sy, (sm || 1) - 1, sd || 1);
      end = new Date(ey, (em || 1) - 1, ed || 1);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 13);
    }

    // Garantir que start <= end
    if (start > end) {
      const tmp = start; start = end; end = tmp;
    }

    const series: ClientRegistrationData[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      series.push({ date: toISO(cursor), actived: 0, inactived: 0, pre_registred: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return series;
  }

  /**
   * Dados mock para pré-registros pendentes
   */
  private getMockPendingPreRegistrations(): PendingPreRegistration[] {
    return [
      {
        id: 1,
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(11) 99999-9999",
        date: "2024-01-21",
        type: "Pessoa Física"
      },
      {
        id: 2,
        name: "Empresa Tech Solutions Ltda",
        email: "contato@techsolutions.com",
        phone: "(11) 3333-4444",
        date: "2024-01-20",
        type: "Pessoa Jurídica"
      },
      {
        id: 3,
        name: "João Silva",
        email: "joao.silva@gmail.com",
        phone: "(11) 88888-7777",
        date: "2024-01-19",
        type: "Pessoa Física"
      },
    ];
  }

  /**
   * Dados mock completos do dashboard
   */
  private getMockDashboardData(): DashboardData {
    return {
      recentActivities: this.getMockRecentActivities(),
      registrationData: this.getMockRegistrationData(),
      pendingPreRegistrations: this.getMockPendingPreRegistrations()
    };
  }
}

export const dashboardService = new DashboardService();