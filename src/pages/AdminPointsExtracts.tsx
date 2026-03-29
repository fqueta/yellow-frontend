import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Plus,
  Minus,
  Gift,
  Calendar,
  Clock,
  User,
  DollarSign,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { ExportActions } from '@/components/ui/ExportActions';
import { Input } from '@/components/ui/input';
import { PrintButton } from '@/components/ui/printbutton';
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
import { toast } from '@/hooks/use-toast';
import { 
  PointsExtract, 
  PointsTransactionType,
  POINTS_TRANSACTION_TYPES 
} from '@/types/redemptions';
import { 
  useInfinitePointsExtracts, 
  usePointsExtractStats, 
  useCreateAdjustment, 
  useExportPointsExtracts 
} from '@/hooks/pointsExtracts';
import { useRefundRedemption } from '@/hooks/redemptions';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '@/styles/print.css';
import * as XLSX from 'xlsx';
import { exportTablePdf } from '@/lib/pdfExport';
import { pointsExtractsService } from '@/services/pointsExtractsService';

// Removido dados mockados - agora usando dados da API

/**
 * Página administrativa para acompanhamento de extratos de pontos
 * Permite visualizar, filtrar e gerenciar todas as movimentações de pontos
 */
const AdminPointsExtracts: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [perPageChoice, setPerPageChoice] = useState<PerPageValue>(20);

  const { ref: scrollTriggerRef, inView } = useInView();

  // Parâmetros para a API (sem page, gerenciado pelo hook infinito)
  const apiParams = useMemo(() => ({
    per_page: perPageChoice === 'all' ? 100 : (perPageChoice as number),
    search: searchTerm || undefined,
    type: typeFilter !== 'all' ? (typeFilter as PointsTransactionType) : undefined,
    dateFrom: dateFromFilter || undefined,
    dateTo: dateToFilter || undefined,
    sort: 'createdAt',
    order: 'desc' as const
  }), [perPageChoice, searchTerm, typeFilter, dateFromFilter, dateToFilter]);

  // Hook de scroll infinito
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfinitePointsExtracts(apiParams, {
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Carregar próxima página quando o trigger entrar na visualização
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Achatar as páginas em um único array
  const extracts = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.data) || [],
    [infiniteData]
  );
  const totalItems = infiniteData?.pages[0]?.total || 0;
  const displayExtracts = extracts;

  // Params específicos para estatísticas (somente filtros relevantes)
  const statsParams = {
    search: apiParams.search,
    type: apiParams.type,
    dateFrom: apiParams.dateFrom,
    dateTo: apiParams.dateTo,
  };
  const { data: stats, isLoading: isLoadingStats } = usePointsExtractStats(statsParams);
  const createAdjustmentMutation = useCreateAdjustment();
  const exportMutation = useExportPointsExtracts();
  
  /**
   * Mutation para extornar resgate
   * pt-BR: Devolve os pontos ao cliente e cancela o resgate.
   * en-US: Returns points to the customer and cancels the redemption.
   */
  const refundRedemptionMutation = useRefundRedemption({
    onSuccess: () => {
      // Recarregar dados da lista e estatísticas
      refetch();
      toast({
        title: 'Resgate extornado',
        description: 'O pedido de resgate foi extornado e os pontos foram devolvidos ao cliente.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao extornar resgate',
        description: error?.message || 'Ocorreu um erro ao processar o extorno.',
        variant: 'destructive',
      });
    },
  });


  // Função para obter o ícone do tipo de transação
  const getTransactionIcon = (type: PointsTransactionType) => {
    // console.log('type',type);
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'redeemed':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case 'adjustment':
        return <DollarSign className="w-4 h-4 text-gray-600" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  // Função para obter a cor do badge do tipo
  const getTypeColor = (type: PointsTransactionType) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'default';
      case 'redeemed':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'refund':
        return 'outline';
      case 'adjustment':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  const getTransactionLabel = (type: PointsTransactionType) => {
    switch (type) {
      case 'earned':
        return 'Pontos ganhos';
      case 'bonus':
        return 'Bônus';
      case 'redeemed':
        return 'Pontos resgatados';
      case 'expired':
        return 'Pontos expirados';
      case 'refund':
        return 'Reembolso';
      case 'adjustment':
        return 'Ajuste manual';
      default:
        return type;
    }
  };

  // Visualizar detalhes do extrato
  const handleViewDetails = (extractId: string) => {
    navigate(`/admin/points-extracts/${extractId}`);
  };

  /**
   * parseNumberField
   * pt-BR: Converte valores numéricos vindos da API (número ou string) para número seguro.
   *        Remove separadores de milhar, ajusta vírgula decimal e ignora caracteres não numéricos.
   * en-US: Converts numeric values from the API (number or string) into a safe number.
   *        Strips thousand separators, normalizes decimal comma, and ignores non-numeric characters.
   */
  function parseNumberField(value: unknown): number {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      // pt-BR: Tratamento robusto para separadores. Considera o último separador ('.' ou ',') como decimal
      //        e remove os demais como milhares. Mantém sinal se presente.
      // en-US: Robust handling for separators. Treats the last separator ('.' or ',') as decimal
      //        and removes all other separators as thousands. Preserves sign if present.
      const trimmed = value.trim();
      const signMatch = trimmed.match(/^\s*([+-])/);
      const sign = signMatch ? signMatch[1] : '';
      const digitsAndSeps = trimmed.replace(/[^0-9.,]/g, '');
      const lastDot = digitsAndSeps.lastIndexOf('.');
      const lastComma = digitsAndSeps.lastIndexOf(',');
      const decSepIndex = Math.max(lastDot, lastComma);

      if (decSepIndex === -1) {
        // Nenhum separador: remover quaisquer espaços e parsear direto
        const intStr = digitsAndSeps.replace(/[^0-9]/g, '');
        const parsedInt = parseFloat(`${sign}${intStr}`);
        return isNaN(parsedInt) ? 0 : parsedInt;
      }

      const decSep = digitsAndSeps[decSepIndex];
      const before = digitsAndSeps.slice(0, decSepIndex).replace(/[^0-9]/g, '');
      const after = digitsAndSeps.slice(decSepIndex + 1).replace(/[^0-9]/g, '');
      const normalized = `${sign}${before}.${after}`;
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * handleExport
   * pt-BR: Exporta os extratos filtrados para um arquivo .xlsx nativo usando SheetJS,
   *        mantendo as colunas visíveis da tabela.
   * en-US: Exports filtered points extracts to a native .xlsx file using SheetJS,
   *        keeping the table’s visible columns.
   */
  const handleExport = async () => {
    try {
      // pt-BR: Colunas exportadas (sem "Expira").
      // en-US: Exported columns (without "Expira").
      const headers = [
        'ID',
        'Cliente',
        'CPF',
        'Email',
        'Tipo',
        'Pontos',
        'Descrição',
        'Saldo Anterior',
        'Saldo Atual',
        'Data',
        'Expiração',
      ];

      const rows = displayExtracts.map((ex: any) => {
        const typeLabel = getTransactionLabel(ex.type);
        // pt-BR: Garante que o campo "Pontos" seja numérico mesmo quando vier como string (ex: "1.000", "-98").
        // en-US: Ensures the "Pontos" field is numeric even when provided as a string (e.g., "1.000", "-98").
        const rawPoints = ex.points ?? ex.valor ?? ex.valor_referencia;
        let pointsVal = parseNumberField(rawPoints);
        // pt-BR: Ajusta o sinal com base no tipo se o valor vier sem sinal explícito.
        // en-US: Adjusts the sign based on the transaction type if the value has no explicit sign.
        const txType = (ex.type ?? ex.tipo) as string | undefined;
        if (txType && /debito|redeemed/i.test(txType) && pointsVal > 0) {
          pointsVal = -pointsVal;
        }
        const createdStr = ex.createdAt ? format(new Date(ex.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—';
        const expirationStr = ex.expirationDate ? format(new Date(ex.expirationDate), 'dd/MM/yyyy', { locale: ptBR }) : '—';
        return [
          ex.id ?? '—',
          ex.userName || 'Não informado',
          ex.userCpf || '—',
          ex.userEmail || 'Não informado',
          typeLabel,
          pointsVal,
          ex.description ? ex.description.replace(/Resgate de produto: /, 'Resgate de: ') : '',
          parseNumberField(ex.balanceBefore),
          parseNumberField(ex.balanceAfter),
          createdStr,
          expirationStr,
        ];
      });

      const aoa = [headers, ...rows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      const maxLen = (vals: any[]) => Math.max(...vals.map(v => (v ? String(v).length : 0)), 0);
      ws['!cols'] = [
        { wch: 6 },
        { wch: Math.max(16, maxLen(rows.map(r => r[1])) + 2) },
        { wch: 14 },
        { wch: Math.max(22, maxLen(rows.map(r => r[3])) + 2) },
        { wch: Math.max(16, maxLen(rows.map(r => r[4])) + 2) },
        { wch: 10 },
        { wch: Math.max(24, maxLen(rows.map(r => r[6])) + 2) },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Extratos');
      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `extratos-pontos-${date}.xlsx`);

      toast({
        title: 'Exportação concluída',
        description: 'Arquivo .xlsx gerado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar extratos:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar os dados.',
        variant: 'destructive'
      });
    }
  };

  /**
   * handleExportPdf
   * pt-BR: Gera um PDF com os extratos filtrados e abre em nova aba.
   * en-US: Generates a PDF with filtered points extracts and opens in a new tab.
   */
  const handleExportPdf = async () => {
    try {
      // pt-BR: Cabeçalhos do PDF (sem "Expira").
      // en-US: PDF headers (without "Expira").
      const headers = [
        'ID',
        'Cliente',
        'CPF',
        'Email',
        'Tipo',
        'Pontos',
        'Descrição',
        'Saldo Anterior',
        'Saldo Atual',
        'Data',
        'Expiração',
      ];

      const rows = displayExtracts.map((ex: any) => {
        const typeLabel = getTransactionLabel(ex.type);
        const rawPoints = ex.points ?? ex.valor ?? ex.valor_referencia;
        let pointsVal = parseNumberField(rawPoints);
        const txType = (ex.type ?? ex.tipo) as string | undefined;
        if (txType && /debito|redeemed/i.test(txType) && pointsVal > 0) {
          pointsVal = -pointsVal;
        }
        const createdStr = ex.createdAt ? format(new Date(ex.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—';
        const expirationStr = ex.expirationDate ? format(new Date(ex.expirationDate), 'dd/MM/yyyy', { locale: ptBR }) : '—';
        return [
          ex.id ?? '—',
          ex.userName || 'Não informado',
          ex.userCpf || '—',
          ex.userEmail || 'Não informado',
          typeLabel,
          pointsVal,
          ex.description ? ex.description.replace(/Resgate de produto: /, 'Resgate de: ') : '',
          parseNumberField(ex.balanceBefore),
          parseNumberField(ex.balanceAfter),
          createdStr,
          expirationStr,
        ];
      });

      exportTablePdf({
        title: 'Extratos de Pontos',
        headers,
        rows,
        orientation: 'landscape',
        filtersLegend: filterLegend,
      });
    } catch (error) {
      console.error('Erro ao exportar extratos (PDF):', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o PDF.',
        variant: 'destructive',
      });
    }
  };

  // Função para criar ajuste manual
  const handleCreateAdjustment = () => {
    // TODO: Implementar modal/formulário para criar ajuste
    toast({
      title: "Criar ajuste",
      description: "Funcionalidade em desenvolvimento...",
    });
  };

  // Função para atualizar dados
  const handleRefresh = () => {
    refetch();
  };

  /**
   * Gera uma legenda textual com os filtros aplicados
   * pt-BR: Monta um texto compacto com tipo, período e busca.
   * en-US: Builds a compact text with type, period and search.
   */
  const buildFilterLegend = (
    typeValue: string,
    searchValue: string,
    dateFrom?: string,
    dateTo?: string,
  ): string => {
    const parts: string[] = [];

    // Tipo de transação
    if (typeValue && typeValue !== 'all') {
      const typeLabel = POINTS_TRANSACTION_TYPES[typeValue as keyof typeof POINTS_TRANSACTION_TYPES]?.label || typeValue;
      parts.push(`Tipo: ${typeLabel}`);
    }

    // Período de datas
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

    // Busca
    if (searchValue && searchValue.trim().length > 0) {
      parts.push(`Busca: "${searchValue.trim()}"`);
    }

    return parts.join(' | ');
  };

  const filterLegend = buildFilterLegend(typeFilter, searchTerm, dateFromFilter, dateToFilter);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
  <h1 className="text-3xl font-bold tracking-tight">Extratos de Pontos</h1>
</div>
          <p className="text-muted-foreground">
            Acompanhe todas as movimentações de pontos dos clientes
          </p>
        </div>
        {/* Área de ações à direita (inclui botão de impressão) */}
        <div className="flex gap-2 items-center justify-end w-full sm:w-auto">
          {/* Ações consolidadas em um único botão com dropdown */}
          <ExportActions
            label="Exportar"
            onPrint={() => window.print()}
            onExportXlsx={handleExport}
            onExportPdf={handleExportPdf}
            printLabel="Imprimir extratos"
          />
          {/* <Button variant="outline" onClick={handleCreateAdjustment}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Ajuste
          </Button> */}
          {/* <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button> */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <PerPageSelector
                value={perPageChoice}
                onChange={(val) => setPerPageChoice(val)}
                options={[20, 50, 100, 200, 500, 1000]}
                label="Por página"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome, email, descrição ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Transação</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(POINTS_TRANSACTION_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda dos filtros aplicada (visível na impressão se houver filtros) */}
      {filterLegend && (
        <div className="text-sm text-gray-600">
          Filtros aplicados: {filterLegend}
        </div>
      )}

      {/* Estatísticas - movidas abaixo dos filtros e refletindo filtros */}
      {isLoadingStats ? (
        // Ajuste de impressão: manter os cards de estatísticas em linha na página impressa
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 print-stats-grid">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        // Ajuste de impressão: manter os cards de estatísticas em linha na página impressa
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 print-stats-grid">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Transações</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalEarned.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Pontos Ganhos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalRedeemed.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Pontos Resgatados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.totalExpired.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Pontos Expirados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Erro ao carregar estatísticas
        </div>
      )}

      {/* Tabela de Extratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Extratos de Pontos ({displayExtracts.length})
          </CardTitle>
          <CardDescription>
            Histórico completo de movimentações de pontos dos clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Saldo Disp.</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Saldo Anterior</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead className="text-right print-hidden">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : displayExtracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayExtracts.map((extract) => (
                    <TableRow key={extract.id}>
                      <TableCell className="font-medium">{extract.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link 
                            to={`/admin/clients/${extract.userId}/view`}
                            className="font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-blue-400"
                          >
                            {extract.userName}
                          </Link>
                          <span className="text-sm text-gray-500">{extract.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(extract.type)} className="flex items-center gap-1 w-fit">
                          {getTransactionIcon(extract.type)}
                          {getTransactionLabel(extract.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 font-medium ${
                          extract.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {extract.points > 0 ? (
                            <Plus className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                          {Math.abs(extract.points).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`font-bold ${
                            (extract.saldo_restante ?? 0) > 0 ? 'text-blue-700' : 'text-gray-400'
                          }`}>
                            {(extract.saldo_restante ?? 0).toLocaleString()}
                          </span>
                          {(extract.valor_usado ?? 0) > 0 && (
                            <span className="text-[10px] text-gray-400">
                              Uso: {(extract.valor_usado ?? 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={extract.description}>
                            {extract.description.replace(/Resgate de produto: /, 'Resgate de: ')}
                          </p>
                          {extract.reference && (
                            <p className="text-xs text-gray-500">Ref: {extract.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {extract.balanceBefore ? extract.balanceBefore.toLocaleString() : '0'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {extract.balanceAfter ? extract.balanceAfter.toLocaleString() : '0'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {extract.createdAt ? format(new Date(extract.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Data não disponível'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {extract.expirationDate ? (() => {
                          const expDate = new Date(extract.expirationDate);
                          const now = new Date();
                          const isExpired = expDate < now;
                          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          const isExpiringSoon = !isExpired && diffDays <= 30;

                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className={`flex items-center gap-1 text-sm ${
                                isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600'
                              }`}>
                                <Clock className={`w-3.5 h-3.5 ${
                                  isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-gray-400'
                                }`} />
                                {format(expDate, 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                              {isExpired && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 w-fit">
                                  Expirado
                                </Badge>
                              )}
                              {isExpiringSoon && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 w-fit border-amber-400 text-amber-600">
                                  Expira em {diffDays}d
                                </Badge>
                              )}
                            </div>
                          );
                        })() : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right print-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(extract.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            {(extract.pedido_id || (extract.reference && (extract.reference.startsWith('R') || extract.reference.startsWith('ORDER')))) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    const rawId = extract.pedido_id || extract.reference;
                                    if (!rawId) return;
                                    const id = String(rawId).replace(/[^0-9]/g, '');
                                    if (!id) return;
                                    const confirmed = window.confirm(`Deseja realmente extornar o resgate #${id}? Os pontos serão devolvidos ao saldo do cliente.`);
                                    if (!confirmed) return;
                                    try {
                                      await refundRedemptionMutation.mutateAsync({ id });
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }}
                                  disabled={refundRedemptionMutation.isPending}
                                  className="text-orange-600"
                                >
                                  <RefreshCw className={`mr-2 h-4 w-4 ${refundRedemptionMutation.isPending ? 'animate-spin' : ''}`} />
                                  Extornar Resgate
                                </DropdownMenuItem>
                              </>
                            )}
                            {/* {extract.reference && (
                              <DropdownMenuItem onClick={() => {
                                if (extract.reference?.startsWith('R')) {
                                  toast({
                                    title: "Navegar para resgate",
                                    description: `Abrindo resgate ${extract.reference}`,
                                  });
                                } else if (extract.reference?.startsWith('ORDER')) {
                                  toast({
                                    title: "Navegar para pedido",
                                    description: `Abrindo pedido ${extract.reference}`,
                                  });
                                }
                              }}>
                                <User className="mr-2 h-4 w-4" />
                                Ver referência
                              </DropdownMenuItem>
                            )} */}
                            {extract.createdBy && (
                              <DropdownMenuItem disabled>
                                <User className="mr-2 h-4 w-4" />
                                Criado por: {extract.createdBy}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Trigger de scroll infinito */}
          <div ref={scrollTriggerRef} className="py-4 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando mais...
              </div>
            )}
            {!hasNextPage && displayExtracts.length > 0 && (
              <p className="text-sm text-gray-400">Fim da lista</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPointsExtracts;
