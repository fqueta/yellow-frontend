import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  UserCheck,
  Package,
  Handshake,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useClientsList } from "@/hooks/clients";
import { usePartnersList } from "@/hooks/partners";
import { useProductsList } from "@/hooks/products";
import { useUsersList } from "@/hooks/users";
import { useRecentActivities, useRegistrationData, usePendingPreRegistrations } from "@/hooks/useDashboard";
import { ClientRegistrationChart } from "@/components/ClientRegistrationChart";
import { VisitorTrendChart } from "@/components/VisitorTrendChart";
import { useAuth } from "@/contexts/AuthContext";
// PeriodSelector removido em favor de inputs de data simples
import { useMemo, useState, useCallback } from "react";
import { getInicioFimMes } from "@/lib/qlib";
import { phoneApplyMask } from '@/lib/masks/phone-apply-mask';

/**
 * getLast14DaysRange
 * pt-BR: Calcula o intervalo dos últimos 14 dias (inclui hoje)
 *        e retorna datas no formato `YYYY-MM-DD`.
 * en-US: Computes the last 14 days range (includes today)
 *        and returns dates in `YYYY-MM-DD` format.
 */
function getLast14DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 13);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { startISO: fmt(start), endISO: fmt(end) };
}

/**
 * Dashboard
 * Página principal que exibe cards de resumo e gráficos.
 * Regra de visibilidade: oculta o card "Parceiros" para usuários
 * com `permission_id` maior ou igual a 5.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPermission = Number(user?.permission_id ?? 0);
  const canShowPartners = userPermission < 5;
  // Hooks para buscar dados das entidades
  const { data: clientsData, isLoading: clientsLoading } = useClientsList({ limit: 1 });
  const { data: partnersData, isLoading: partnersLoading } = usePartnersList({ limit: 1 });
  const { data: productsData, isLoading: productsLoading } = useProductsList({ limit: 1 });
  const { data: usersData, isLoading: usersLoading } = useUsersList({ limit: 1 });

  // Hooks para dados dinâmicos do dashboard
  // Estado de período selecionado: inicia já com últimos 14 dias
  const initialRange = getLast14DaysRange();
  const [startDate, setStartDate] = useState<string | undefined>(initialRange.startISO);
  const [endDate, setEndDate] = useState<string | undefined>(initialRange.endISO);
  // Removido estado separado de período aplicado para evitar divergências na UI
  // Label removido, usaremos apenas Data Inicial/Final

  // (movido para após a declaração dos hooks de dados)

  /**
   * handleStartDateChange
   * pt-BR: Atualiza o estado da Data Inicial a partir do input.
   * en-US: Updates the Initial Date state from the input value.
   */
  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
  }, []);

  /**
   * handleEndDateChange
   * pt-BR: Atualiza o estado da Data Final a partir do input.
   * en-US: Updates the Final Date state from the input value.
   */
  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
  }, []);

  // Envia startDate/endDate para atividades recentes, mas só busca ao acionar botão
  const { data: recentActivities, isLoading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useRecentActivities(
    4,
    startDate,
    endDate,
    { enabled: !!startDate && !!endDate, refetchOnWindowFocus: false }
  );
  const { data: registrationData, isLoading: registrationLoading, error: registrationError, refetch: refetchRegistration } = useRegistrationData(
    startDate,
    endDate,
    { enabled: !!startDate && !!endDate, refetchOnWindowFocus: false }
  );
  const { data: pendingPreRegistrations, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingPreRegistrations(
    3,
    startDate,
    endDate,
    { enabled: !!startDate && !!endDate, refetchOnWindowFocus: false }
  );

  /**
   * handleApplyFilters
   * pt-BR: Dispara as requisições do dashboard usando as datas atuais.
   * en-US: Triggers dashboard requests using the current date filters.
   */
  const handleApplyFilters = useCallback(() => {
    refetchRegistration();
    refetchActivities();
    refetchPending();
  }, [refetchRegistration, refetchActivities, refetchPending]);

  // Consultas agora são habilitadas automaticamente com o intervalo inicial.

  /**
   * formatDatePtBr
   * pt-BR: Converte YYYY-MM-DD para DD/MM/YYYY.
   * en-US: Converts YYYY-MM-DD to DD/MM/YYYY.
   */
  const formatDatePtBr = useCallback((iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }, []);

  /**
   * chartDescription
   * pt-BR: Texto de descrição do gráfico refletindo o período aplicado.
   * en-US: Chart description text reflecting the applied period.
   */
  const chartDescription = useMemo(() => {
    if (startDate && endDate) {
      return `Período aplicado: ${formatDatePtBr(startDate)} a ${formatDatePtBr(endDate)}`;
    }
    return "Selecione um período e clique em Aplicar Filtros";
  }, [startDate, endDate, formatDatePtBr]);

  /**
   * chartTitle
   * pt-BR: Título do gráfico refletindo o período aplicado.
   * en-US: Chart title reflecting the applied period.
   */
  const chartTitle = useMemo(() => {
    if (startDate && endDate) {
      const ini = formatDatePtBr(startDate);
      const fim = formatDatePtBr(endDate);
      return `Evolução dos Cadastros de Clientes (${ini} a ${fim})`;
    }
    return "Evolução dos Cadastros de Clientes";
  }, [startDate, endDate, formatDatePtBr]);
  // console.log('pendingPreRegistrations:', pendingPreRegistrations);
  // Verificar se há erro 403 (Acesso negado)
  const hasAccessError = [activitiesError, registrationError, pendingError].some(
    error => error && (error as any)?.status === 403
  );
  // console.log('activitiesError:', activitiesError);
  
  // Verificar se ainda está carregando dados iniciais
  const isInitialLoading = (
    activitiesLoading || 
    registrationLoading || 
    pendingLoading
  ) && !hasAccessError;

  /**
   * filteredRecentActivities
   * pt-BR: Lista de atividades recentes filtradas pelo período selecionado.
   * en-US: Recent activities filtered by the selected period.
   */
  // Garante array para evitar erros de tipagem quando a API ainda não respondeu
  const recentClientActivities = Array.isArray(recentActivities) ? recentActivities : [];
  const filteredRecentActivities = useMemo(() => {
    if (!startDate || !endDate) return recentClientActivities;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return recentClientActivities.filter((a: any) => {
      if (!a?.created_at) return true; // Mantém quando mock não tem data
      // created_at vem como dd/mm/yyyy HH:MM
      try {
        const [datePart, timePart] = String(a.created_at).split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = (timePart || '00:00').split(':').map(Number);
        const d = new Date(year, (month || 1) - 1, day, hour || 0, minute || 0);
        return d >= start && d <= end;
      } catch {
        return true;
      }
    });
  }, [recentClientActivities, startDate, endDate]);

  /**
   * Abre a visualização rápida do cliente
   * Navega para `/admin/clients/:id/view` utilizando o ID da atividade.
   */
  const handleQuickViewClient = (id: string | number) => {
    navigate(`/admin/clients/${String(id)}/view`);
  };

  // Se há erro de acesso, exibir apenas a mensagem
  if (hasAccessError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acesso não disponível</h2>
          <p className="text-gray-600">Você não tem permissão para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  // Se ainda está carregando, não mostrar nada para evitar flash de conteúdo
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Dados das entidades
  const stats = {
    clientsCount: clientsData?.total || 0,
    partnersCount: partnersData?.total || 0,
    productsCount: productsData?.total || 0,
    usersCount: usersData?.total || 0,
  };
  const clientRegistrationData = Array.isArray(registrationData) ? registrationData : [];
  const pendingPreRegistrationsData = Array.isArray(pendingPreRegistrations) ? pendingPreRegistrations : [];
  // console.log('pendingPreRegistrationsData:', pendingPreRegistrationsData);
  // Verificação simples dos dados de registro
  // if (clientRegistrationData.length > 0) {
  //   console.log(`Dashboard: ${clientRegistrationData.length} dias de dados carregados (${clientRegistrationData[0]?.date} a ${clientRegistrationData[clientRegistrationData.length - 1]?.date})`);
  // }
  
  //console.log('clientRegistrationData:', clientRegistrationData);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de clientes
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Campos simples de período: Data Inicial e Data Final */}
          <div className="space-y-1 w-full sm:w-[180px]">
            <label className="text-sm font-medium">Data Inicial</label>
            <Input
              type="date"
              value={startDate || ""}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-1 w-full sm:w-[180px]">
            <label className="text-sm font-medium">Data Final</label>
            <Input
              type="date"
              value={endDate || ""}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleApplyFilters} variant="default">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>



      
      {/* Seção de Gráficos e Tendências */}
      <div className="space-y-6">
        {/* <div>
          <h2 className="text-xl font-semibold mb-4">Gráficos e Tendências</h2>
        </div> */}
        
        {/* Gráfico de Tendência de Visitantes */}
        {/* <VisitorTrendChart /> */}
        
        {/* Gráfico de Cadastros de Clientes */}
        {registrationLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Evolução dos Cadastros de Clientes</CardTitle>
              <CardDescription>Acompanhamento diário dos cadastros por status nos últimos 14 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Carregando dados do gráfico...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ClientRegistrationChart 
            data={clientRegistrationData}
            title={chartTitle}
            description={chartDescription}
          />
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Client Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes - Clientes</CardTitle>
            <CardDescription>
              Últimos cadastros e alterações de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Carregando atividades...</p>
                </div>
              ) : recentClientActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              ) : (
                filteredRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        activity.status === "actived" ? "bg-green-100" :
                        activity.status === "inactived" ? "bg-red-100" : "bg-yellow-100"
                      }`}>
                        <Users className={`h-4 w-4 ${
                          activity.status === "actived" ? "text-green-600" :
                          activity.status === "inactived" ? "text-red-600" : "text-yellow-600"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.client} • {activity.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.cpf || activity.cnpj}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        activity.status === "actived" ? "default" :
                        activity.status === "inactived" ? "destructive" : "secondary"
                      }>
                        {activity.status === "actived" && "Ativo"}
                        {activity.status === "inactived" && "Inativo"}
                        {activity.status === "pre_registred" && "Pré-cadastro"}
                      </Badge>
                      <div className="flex gap-1 justify-end mt-2">
                        <Button onClick={() => handleQuickViewClient(activity.id)} size="sm" variant="outline" className="text-xs px-2">
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Pre-Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Pré-cadastros Pendentes
            </CardTitle>
            <CardDescription>
              Cadastros aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Carregando pré-registros...</p>
                </div>
              ) : pendingPreRegistrationsData.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Nenhum pré-registro pendente</p>
                </div>
              ) : (
                pendingPreRegistrationsData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                        <Users className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.email} • {item.date}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.phone ? phoneApplyMask(String(item.phone)) : 'Não informado'} • {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        Pré-cadastro
                      </Badge>
                      <div className="flex gap-1 text-right">
                        {/* <Button size="sm" variant="ghost" className="text-xs px-2">
                          Rejeitar
                        </Button> */}
                        <Button onClick={() => navigate(`/admin/clients/${item.id}/view`)} size="sm" variant="outline" className="text-xs px-2">
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>  
      {/* Resumo das Entidades do Projeto */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canShowPartners && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Parceiros
              </CardTitle>
              <CardDescription>Gestão de parceiros comerciais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {partnersLoading ? "..." : stats.partnersCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Total cadastrados</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/partners">
                    Ver todos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>Total de clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {clientsLoading ? "..." : stats.clientsCount}
                </div>
                <p className="text-xs text-muted-foreground">Total cadastrados</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/clients">
                  Ver todos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
          {canShowPartners && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>Usuários do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {usersLoading ? "..." : stats.usersCount}
                </div>
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/settings/users">
                  Gerenciar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
          )}
      </div>    
    </div>
  );
}