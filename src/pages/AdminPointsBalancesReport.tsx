import React, { useMemo, useState } from 'react';
import { RefreshCw, Search, Users, Wallet, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExportActions } from '@/components/ui/ExportActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PerPageSelector, { PerPageValue } from '@/components/ui/PerPageSelector';
import { useCustomerPointsBalancesReport } from '@/hooks/pointsExtracts';
import { exportTablePdf } from '@/lib/pdfExport';
import { toast } from '@/hooks/use-toast';
import { pointsExtractsService } from '@/services/pointsExtractsService';
import * as XLSX from 'xlsx';

/**
 * Formata a quantidade de pontos para exibição.
 */
function formatPoints(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata a data de cadastro do cliente.
 */
function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

/**
 * Página de relatório com saldo total de pontos por cliente.
 */
const AdminPointsBalancesReport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<'name' | 'email' | 'created_at' | 'saldo_total'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [perPageChoice, setPerPageChoice] = useState<PerPageValue>(20);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const reportParams = useMemo(() => ({
    page: currentPage,
    per_page: perPageChoice === 'all' ? 100 : Number(perPageChoice),
    search: searchTerm || undefined,
    order_by: orderBy,
    order,
  }), [currentPage, perPageChoice, searchTerm, orderBy, order]);

  const reportQuery = useCustomerPointsBalancesReport(reportParams, {
    keepPreviousData: true,
  });

  const reportData = reportQuery.data;
  const reportItems = reportData?.data ?? [];
  const summary = reportData?.summary;
  const totalPages = reportData?.last_page ?? 1;

  /**
   * Reinicia a paginação ao mudar filtros relevantes.
   */
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  /**
   * Monta as linhas do relatório no formato usado pelas exportações.
   */
  const buildExportRows = (items: typeof reportItems) => {
    return items.map((item) => [
      item.name || 'Não informado',
      item.email || 'Não informado',
      item.cpf || 'Não informado',
      formatDate(item.created_at),
      item.saldo_total,
    ]);
  };

  /**
   * Busca todos os registros do relatório respeitando os filtros atuais.
   */
  /**
   * Exporta os dados para Excel usando o backend de alta performance.
   */
  const handleExportXlsx = async () => {
    try {
      setIsExportingAll(true);
      const blob = await pointsExtractsService.downloadCustomerBalancesExcel({
        search: reportParams.search,
        order_by: reportParams.order_by,
        order: reportParams.order,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `relatorio-saldo-clientes-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Exportação concluída',
        description: 'Relatório Excel gerado com sucesso via servidor.',
      });
    } catch (error: any) {
      console.error('Erro ao exportar relatório para Excel:', error);
      toast({
        title: 'Erro na exportação',
        description: error.message || 'Não foi possível gerar o arquivo Excel.',
        variant: 'destructive',
      });
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportAllXlsx = handleExportXlsx;

  /**
   * Gera a legenda textual com os filtros atuais para usar nas exportações.
   */
  const filterLegend = useMemo(() => {
    const parts: string[] = [];

    if (searchTerm.trim()) {
      parts.push(`Busca: "${searchTerm.trim()}"`);
    }

    parts.push(`Ordenação: ${orderBy} (${order})`);

    return parts.join(' | ');
  }, [searchTerm, orderBy, order]);

  /**
   * Exporta a listagem atual para PDF.
   */
  const handleExportPdf = async () => {
    try {
      const headers = ['Cliente', 'E-mail', 'CPF', 'Cadastro', 'Saldo Total'];
      const rows = buildExportRows(reportItems).map((row) => [
        row[0],
        row[1],
        row[2],
        row[3],
        `${formatPoints(Number(row[4]))} pts`,
      ]);

      await exportTablePdf({
        title: 'Relatório de Saldo de Pontos por Cliente',
        headers,
        rows,
        orientation: 'landscape',
        filtersLegend: filterLegend,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório para PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Alias para PDF (por simplicidade, exportamos os itens da página atual ou carregada)
   */
  const handleExportAllPdf = handleExportPdf;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatorios de Pontos</h1>
          <p className="text-muted-foreground">
            Listagem do saldo total de pontos por cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportActions
            label="Exportar"
            onExportXlsx={handleExportXlsx}
            onExportPdf={handleExportPdf}
            disabled={!reportItems.length}
            xlsxLabel="Exportar Excel"
            pdfLabel="Exportar PDF"
          />
          <ExportActions
            label={isExportingAll ? 'Exportando...' : 'Exportar Todos'}
            onExportXlsx={handleExportAllXlsx}
            onExportPdf={handleExportAllPdf}
            disabled={isExportingAll || reportQuery.isFetching || !reportData?.total}
            xlsxLabel="Todos em Excel"
            pdfLabel="Todos em PDF"
          />
          <Button
            variant="outline"
            onClick={() => reportQuery.refetch()}
            disabled={reportQuery.isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${reportQuery.isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes listados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_clients ?? 0}</div>
            <CardDescription>Total de clientes no filtro atual.</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPoints(summary?.total_balance ?? 0)} pts</div>
            <CardDescription>Soma do saldo de pontos dos clientes filtrados.</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com saldo positivo</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.clients_with_balance ?? 0}</div>
            <CardDescription>Clientes com saldo acima de zero.</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Pesquise clientes e ordene o relatorio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => handleFilterChange(() => setSearchTerm(event.target.value))}
                placeholder="Buscar por nome, email, CPF ou CNPJ"
                className="pl-9"
              />
            </div>

            <Select
              value={orderBy}
              onValueChange={(value: 'name' | 'email' | 'created_at' | 'saldo_total') =>
                handleFilterChange(() => setOrderBy(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="created_at">Cadastro</SelectItem>
                <SelectItem value="saldo_total">Saldo</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={order}
              onValueChange={(value: 'asc' | 'desc') => handleFilterChange(() => setOrder(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Direcao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente</SelectItem>
                <SelectItem value="desc">Decrescente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <PerPageSelector
              value={perPageChoice}
              onChange={(value) => handleFilterChange(() => setPerPageChoice(value))}
              options={[20, 50, 100, 200, 500, 'all']}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo por cliente</CardTitle>
          <CardDescription>
            {reportData?.total ?? 0} cliente(s) encontrado(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportQuery.isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando relatorio...</div>
          ) : reportQuery.isError ? (
            <div className="py-10 text-center text-destructive">
              Nao foi possivel carregar o relatorio.
            </div>
          ) : reportItems.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Nenhum cliente encontrado com os filtros informados.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Saldo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.email || '-'}</TableCell>
                        <TableCell>{item.cpf || '-'}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPoints(item.saldo_total)} pts
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pagina {reportData?.current_page ?? 1} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={(reportData?.current_page ?? 1) <= 1 || reportQuery.isFetching}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={(reportData?.current_page ?? 1) >= totalPages || reportQuery.isFetching}
                    >
                      Proxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPointsBalancesReport;
