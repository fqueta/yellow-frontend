import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck,
  MoreHorizontal,
  Calendar,
  User,
  Gift,
  Phone,
  FileText,
  Loader2
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ExportActions } from '@/components/ui/ExportActions';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PerPageSelector, { PerPageValue } from '@/components/ui/PerPageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useUpdateRedemptionStatus, useRefundRedemption, useInfiniteAllRedemptions } from '@/hooks/redemptions';
import { useDebounce } from '@/hooks/useDebounce';
import { redemptionsService } from '@/services/redemptionsService';
import { 
  Redemption, 
  RedemptionStatus, 
  REDEMPTION_STATUSES
} from '@/types/redemptions';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrintButton } from '@/components/ui/printbutton';
import '@/styles/print.css';
import { phoneApplyMask } from '@/lib/masks/phone-apply-mask';
import * as XLSX from 'xlsx';
import { exportTablePdf } from '@/lib/pdfExport';



/**
 * Página administrativa para acompanhamento de resgates da loja de pontos
 * Permite visualizar, filtrar e gerenciar todos os pedidos de resgate
 */
const AdminRedemptions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus | 'all'>((searchParams.get('status') as any) || 'all');
  // Filtros de período (date range)
  const [dateFromFilter, setDateFromFilter] = useState<string>(searchParams.get('date_from') || '');
  const [dateToFilter, setDateToFilter] = useState<string>(searchParams.get('date_to') || '');

  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || 'all');
  const [itemsPerPage, setItemsPerPage] = useState<PerPageValue>(Number(searchParams.get('per_page')) || 20);

  // Sincronizar filtros com a URL automaticamente
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFromFilter) params.set('date_from', dateFromFilter);
    if (dateToFilter) params.set('date_to', dateToFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (itemsPerPage !== 20) params.set('per_page', String(itemsPerPage));

    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, statusFilter, dateFromFilter, dateToFilter, categoryFilter, itemsPerPage, setSearchParams]);

  // Estados para o modal de estorno
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundData, setRefundData] = useState<{ id: string } | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const { ref, inView } = useInView();

  const {
    data: redemptionsInfiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfiniteAllRedemptions({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFromFilter || undefined,
    dateTo: dateToFilter || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: debouncedSearchTerm || undefined,
    per_page: itemsPerPage === 'all' ? 999999 : (itemsPerPage as number)
  }, {
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Carregar próxima página quando o elemento entrar na visualização
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Achatar os dados das páginas em um único array
  const redemptions = useMemo(() => {
    return redemptionsInfiniteData?.pages.flatMap(page => page.data) || [];
  }, [redemptionsInfiniteData]);

  const totalItems = redemptionsInfiniteData?.pages[0]?.total || 0;

  // Função para obter o ícone do status
  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Função para obter a cor do badge de status
  const getStatusColor = (status: RedemptionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * formatDisplayPhone
   * pt-BR: Formata telefone para exibição com DDI usando a máscara padrão.
   * en-US: Formats phone for display with DDI using the standard mask.
   */
  const formatDisplayPhone = (phone?: string) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    return digits ? phoneApplyMask(digits) : '';
  };



  // Filtrar resgates baseado nos filtros aplicados
  /**
   * Aplica filtros de busca, status e categoria.
   * Normaliza campos para string para evitar erros (ex.: id numérico).
   */
  const filteredRedemptions = useMemo(() => {
    const term = (debouncedSearchTerm || '').toLowerCase();

    return redemptions.filter((redemption: any) => {
      const idStr = String(redemption?.id ?? '').toLowerCase();
      const userNameStr = String(redemption?.userName ?? '').toLowerCase();
      const userEmailStr = String(redemption?.userEmail ?? '').toLowerCase();
      const productNameStr = String(redemption?.productName ?? '').toLowerCase();
      const categoryStr = String(redemption?.productCategory ?? '').toLowerCase();

      const matchesSearch =
        userNameStr.includes(term) ||
        userEmailStr.includes(term) ||
        productNameStr.includes(term) ||
        idStr.includes(term);

      const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || categoryStr === String(categoryFilter).toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [redemptions, debouncedSearchTerm, statusFilter, categoryFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = redemptions.length;
    const pending = redemptions.filter(r => r.status === 'pending').length;
    const processing = redemptions.filter(r => r.status === 'processing').length;
    const confirmed = redemptions.filter(r => r.status === 'confirmed').length;
    const shipped = redemptions.filter(r => r.status === 'shipped').length;
    const delivered = redemptions.filter(r => r.status === 'delivered').length;
    const cancelled = redemptions.filter(r => r.status === 'cancelled').length;
    const totalPoints = redemptions.reduce((sum, r) => sum + r.pointsUsed, 0);
    
    return { total, pending, processing, confirmed, shipped, delivered, cancelled, totalPoints };
  }, [redemptions]);

  // Hook para atualizar status do resgate
  /**
   * Mutation para atualizar o status de um resgate.
   * Ao concluir com sucesso, força um refetch da listagem para refletir a mudança imediatamente.
   */
  const updateRedemptionStatusMutation = useUpdateRedemptionStatus({
    onSuccess: () => {
      refetch();
      toast({
        title: "Status atualizado",
        description: "Status do resgate foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error?.message || "Ocorreu um erro ao atualizar o status do resgate.",
        variant: "destructive",
      });
    }
  });

  // Hook para extornar resgate
  const refundRedemptionMutation = useRefundRedemption({
    onSuccess: () => {
      refetch();
      toast({
        title: "Resgate estornado",
        description: "Os pontos foram devolvidos ao cliente com sucesso.",
      });
      setIsRefundDialogOpen(false);
      setRefundReason('');
      setRefundData(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao estornar",
        description: error?.message || "Ocorreu um erro ao estornar o resgate.",
        variant: "destructive",
      });
    }
  });

  // Função para atualizar status do resgate
  /**
   * Atualiza o status do resgate.
   * Bloqueia edição se o resgate estiver cancelado ou estornado.
   */
  const handleStatusUpdate = async (redemptionId: string, newStatus: RedemptionStatus) => {
    // Bloqueio de edição para pedidos cancelados ou estornados
    const target = (redemptions as any[]).find((r: any) => r.id === redemptionId);
    if (target && (target.status === 'cancelled' || target.status === 'refunded')) {
      toast({
        title: 'Ação não permitida',
        description: 'Edição de status indisponível para pedidos cancelados ou estornados.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateRedemptionStatusMutation.mutateAsync({
        id: redemptionId,
        status: newStatus as string
      });
    } catch (error) {
      // Erro já tratado no onError da mutation
      console.error('Erro ao atualizar status:', error);
    }
  };

  /**
   * handleRefund
   * pt-BR: Abre o modal para confirmar o estorno de um resgate.
   */
  const handleRefund = (redemptionId: string) => {
    setRefundData({ id: redemptionId });
    setRefundReason('');
    setIsRefundDialogOpen(true);
  };

  /**
   * handleConfirmRefund
   * pt-BR: Executa o estorno do resgate com o motivo fornecido.
   */
  const handleConfirmRefund = async () => {
    if (!refundData) return;

    try {
      await refundRedemptionMutation.mutateAsync({
        id: refundData.id,
        notes: refundReason
      });
    } catch (error) {
      console.error('Erro ao estornar resgate:', error);
    }
  };

  // Função para visualizar detalhes do resgate
  const handleViewDetails = (redemptionId: string) => {
    navigate(`/admin/redemptions/${redemptionId}`);
  };

  /**
   * handleExport
   * pt-BR: Exporta os resgates filtrados para um arquivo .xlsx nativo (SheetJS),
   *        mantendo as colunas visíveis: ID, Cliente, Email, Telefone, Produto,
   *        Categoria, Pontos, Data e Status.
   * en-US: Exports filtered redemptions to a native .xlsx file (SheetJS),
   *        keeping the visible columns: ID, Customer, Email, Phone, Product,
   *        Category, Points, Date and Status.
   */
  /**
   * Exporta os resgates (pedidos) para Excel usando o backend de alta performance.
   */
  const handleExportXlsx = async () => {
    try {
      const blob = await redemptionsService.downloadRedemptionsExcel({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `pedidos-resgate-${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Exportação concluída',
        description: 'Arquivo Excel gerado com sucesso via servidor.',
      });
    } catch (error: any) {
      console.error('Erro ao exportar resgates:', error);
      toast({
        title: 'Erro na exportação',
        description: error.message || 'Não foi possível gerar o arquivo Excel.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = handleExportXlsx;

  /**
   * handleExportPdf
   * pt-BR: Gera um PDF com os resgates filtrados e abre em nova aba.
   * en-US: Generates a PDF with filtered redemptions and opens in a new tab.
   */
  const handleExportPdf = () => {
    try {
      const headers = [
        'ID',
        'Cliente',
        'CPF',
        'Email',
        'Telefone',
        'Produto',
        'Categoria',
        'Pontos',
        'Data',
        'Status',
      ];

      const rows = filteredRedemptions.map((r: any) => {
        const phone = formatDisplayPhone(r.userPhone) || 'Não informado';
        const dateStr = r.redemptionDate ? format(new Date(r.redemptionDate), 'dd/MM/yyyy', { locale: ptBR }) : '—';
        const statusLabel = REDEMPTION_STATUSES[r.status]?.label || r.status || '—';
        return [
          r.id ?? '—',
          r.userName || 'Não informado',
          r.userCpf || '—',
          r.userEmail || 'Não informado',
          phone,
          r.productName || '—',
          r.productCategory || '—',
          typeof r.pointsUsed === 'number' ? r.pointsUsed : '—',
          dateStr,
          statusLabel,
        ];
      });

      exportTablePdf({
        title: 'Resgates da Loja de Pontos',
        headers,
        rows,
        orientation: 'landscape',
        filtersLegend: filterLegend,
      });
    } catch (error) {
      console.error('Erro ao exportar resgates (PDF):', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o PDF.',
        variant: 'destructive',
      });
    }
  };


  // Obter categorias únicas para o filtro
  const categories = Array.from(new Set(redemptions.map((r: any) => r.productCategory))) as string[];

  /**
   * buildFilterLegend
   * pt-BR: Constrói a legenda dos filtros aplicados (status, categoria, período, busca).
   * en-US: Builds legend text for applied filters (status, category, period, search).
   */
  const buildFilterLegend = (
    statusValue: RedemptionStatus | 'all',
    categoryValue: string,
    searchValue: string,
    dateFrom?: string,
    dateTo?: string,
  ): string => {
    const parts: string[] = [];

    if (statusValue && statusValue !== 'all') {
      const statusLabel = REDEMPTION_STATUSES[statusValue]?.label || statusValue;
      parts.push(`Status: ${statusLabel}`);
    }
    if (categoryValue && categoryValue !== 'all') {
      parts.push(`Categoria: ${categoryValue}`);
    }
    // pt-BR: Evita deslocamento por timezone ao formatar datas (yyyy-MM-dd) do input date.
    // en-US: Avoid timezone shift when formatting date-only strings from input date.
    const fmtLocal = (d: string) => {
      try {
        const parsed = parse(d, 'yyyy-MM-dd', new Date());
        return format(parsed, 'dd/MM/yyyy');
      } catch {
        return d;
      }
    };
    if (dateFrom && dateTo) {
      parts.push(`Período: ${fmtLocal(dateFrom)} a ${fmtLocal(dateTo)}`);
    } else if (dateFrom) {
      parts.push(`Período: a partir de ${fmtLocal(dateFrom)}`);
    } else if (dateTo) {
      parts.push(`Período: até ${fmtLocal(dateTo)}`);
    }
    if (searchValue && searchValue.trim().length > 0) {
      parts.push(`Busca: "${searchValue.trim()}"`);
    }

    return parts.join(' | ');
  };

  const filterLegend = buildFilterLegend(
    statusFilter,
    categoryFilter,
    debouncedSearchTerm,
    dateFromFilter,
    dateToFilter,
  );

  /**
   * Reset when filters or search change
   * Recarrega do zero quando filtros ou busca mudarem
   */
  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, statusFilter, categoryFilter, dateFromFilter, dateToFilter, itemsPerPage, refetch]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos de Resgates</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todos os pedidos realizados pelos clientes
          </p>
        </div>
        <div className="flex gap-2">
          {/* Ações consolidadas em um único botão com dropdown */}
          <ExportActions
            label="Exportar"
            onPrint={() => window.print()}
            onExportXlsx={handleExport}
            onExportPdf={handleExportPdf}
            printLabel="Imprimir resgates"
          />
        </div>
      </div>

      {/* Filtros (não imprimir) */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <PerPageSelector
                value={itemsPerPage}
                onChange={(val) => {
                  setItemsPerPage(val);
                }}
                options={[20, 50, 100, 200, 500, 1000]}
                label="Itens iniciais"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome, email, produto ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RedemptionStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(REDEMPTION_STATUSES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Data Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>


            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filterLegend && (
        <div className="text-sm text-gray-600">
          Filtros aplicados: {filterLegend}
        </div>
      )}

      {/* Estatísticas - agora abaixo dos filtros */}
      {/* Ajuste de impressão: manter os cards de estatísticas em uma linha na página impressa */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 print-stats-grid-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processando</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-sm text-gray-600">Enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Entregues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pontos Usados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Resgates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Resgates ({filteredRedemptions.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os resgates realizados na loja de pontos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Entrega</TableHead> */}
                  <TableHead className="text-right print-hidden">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRedemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">Nenhum resgate encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRedemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-medium">{redemption.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{redemption.userName}</span>
                          <span className="text-sm text-gray-500">{redemption.userEmail}</span>
                          {redemption.userPhone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {formatDisplayPhone(redemption.userPhone)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={redemption.productImage} 
                            alt={redemption.productName}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{redemption.productName}</span>
                            <span className="text-sm text-gray-500">{redemption.productCategory}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{redemption.pointsUsed.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(redemption.redemptionDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`flex items-center gap-1 w-fit ${getStatusColor(redemption.status)}`}
                        >
                          {getStatusIcon(redemption.status)}
                          {REDEMPTION_STATUSES[redemption.status].label}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        {redemption.estimatedDelivery && (
                          <span className="text-sm">
                            {format(new Date(redemption.estimatedDelivery), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                      </TableCell> */}
                      <TableCell className="text-right print-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(redemption.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(redemption.id, 'confirmed')}
                              disabled={updateRedemptionStatusMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(redemption.id, 'shipped')}
                              disabled={updateRedemptionStatusMutation.isPending}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Marcar como enviado
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(redemption.id, 'delivered')}
                              disabled={updateRedemptionStatusMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como entregue
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(redemption.id, 'cancelled')}
                              disabled={updateRedemptionStatusMutation.isPending || redemption.status === 'cancelled' || redemption.status === 'refunded'}
                              className="text-red-500"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRefund(redemption.id)}
                              disabled={refundRedemptionMutation.isPending || redemption.status === 'refunded' || redemption.status === 'cancelled'}
                              className="text-orange-600"
                            >
                              <RefreshCw className={`mr-2 h-4 w-4 ${refundRedemptionMutation.isPending ? 'animate-spin' : ''}`} />
                              Estorno
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Trigger para Scroll Infinito */}
          {totalItems > 0 && (hasNextPage || isFetchingNextPage) && (
            <div 
              ref={ref} 
              className="flex flex-col items-center justify-center p-8 gap-4 border-t bg-gray-50/50"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando mais registros...</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Role para carregar mais
                </div>
              )}
            </div>
          )}

          {totalItems > 0 && !hasNextPage && !isFetchingNextPage && (
            <div className="flex flex-col items-center justify-center p-8 gap-4 border-t bg-gray-50/50">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Fim da lista • {redemptions.length} registros carregados</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Mostrando {redemptions.length} de {totalItems} resgates
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modal de Confirmação de Estorno */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Estorno</DialogTitle>
            <DialogDescription>
              Deseja realmente estornar este resgate? Os pontos serão devolvidos ao saldo do cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo do Estorno (opcional)</label>
              <Textarea
                placeholder="Informe o motivo para facilitar a auditoria..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="h-24 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
              disabled={refundRedemptionMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmRefund}
              disabled={refundRedemptionMutation.isPending}
            >
              {refundRedemptionMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Estornando...
                </>
              ) : (
                'Confirmar Estorno'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRedemptions;
