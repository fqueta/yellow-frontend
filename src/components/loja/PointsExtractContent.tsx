import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Search, 
  Filter,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  useAuthenticatedUserInfinitePointsExtracts, 
  useAuthenticatedUserPointsBalance 
} from '@/hooks/pointsExtracts';
import { formatDate } from '@/lib/utils';
import { PointsTransactionType } from '@/types/redemptions';
import { useInView } from 'react-intersection-observer';

const PointsExtractContent: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = React.useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');

  // Debounce: só dispara a query após 400ms sem digitar
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);
  const { ref, inView } = useInView();

  const { 
    data: extractInfiniteData, 
    isLoading: isLoadingExtract,
    isFetching: isFetchingExtract,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useAuthenticatedUserInfinitePointsExtracts({
    search: debouncedSearch,
    type: type as any,
    dateFrom,
    dateTo,
    per_page: 20
  }, {
    placeholderData: (previousData: any) => previousData,
    staleTime: 0,
  });

  const { data: balanceData, isLoading: isLoadingBalance } = useAuthenticatedUserPointsBalance({
    search: debouncedSearch,
    dateFrom,
    dateTo
  });

  // Carregar próxima página quando o elemento final entrar em visualização
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setType(undefined);
    setDateFrom('');
    setDateTo('');
  };

  const getTransactionIcon = (type: PointsTransactionType) => {
    switch (type) {
      case 'earned':
      case 'bonus':
      case 'refund':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'redeemed':
      case 'expired':
        return <ArrowDownLeft className="w-5 h-5 text-red-500" />;
      default:
        return <History className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTransactionColor = (type: PointsTransactionType) => {
    switch (type) {
      case 'earned':
      case 'bonus':
      case 'refund':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'redeemed':
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTypeName = (type: PointsTransactionType) => {
    switch (type) {
      case 'earned': return 'Ganho';
      case 'redeemed': return 'Resgate';
      case 'bonus': return 'Bônus';
      case 'adjustment': return 'Ajuste';
      case 'refund': return 'Reembolso';
      case 'expired': return 'Expirado';
      default: return type;
    }
  };



  // Achatar todas as páginas de transações em um único array
  const transactions = extractInfiniteData?.pages.flatMap(page => page.data) || [];
  const stats = balanceData || {
    total_points: 0,
    total_earned: 0,
    total_spent: 0,
    active_points: 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Acumulado</p>
                <p className="text-2xl font-bold text-green-900">{Number(stats.total_earned).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
 
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Utilizado</p>
                <p className="text-2xl font-bold text-red-900">{Number(stats.total_spent).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-blue-900">{Number(stats.active_points).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            {isFetchingExtract && !isFetchingNextPage ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40 bg-gray-50 border-gray-200 text-sm"
              placeholder="De"
            />
            <span className="text-gray-400">até</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40 bg-gray-50 border-gray-200 text-sm"
              placeholder="Até"
            />
          </div>
          {(search || type || dateFrom || dateTo) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={type === undefined ? 'default' : 'outline'}
            onClick={() => setType(undefined)}
            size="sm"
            className={type === undefined ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Todos
          </Button>
          <Button
            variant={type === 'credito' ? 'default' : 'outline'}
            onClick={() => setType('credito')}
            size="sm"
            className={type === 'credito' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Ganhos
          </Button>
          <Button
            variant={type === 'debito' ? 'default' : 'outline'}
            onClick={() => setType('debito')}
            size="sm"
            className={type === 'debito' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Gastos
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Saldo Anterior</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Pontos</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Saldo Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingExtract && !extractInfiniteData ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const isPositive = transaction.points > 0;
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.reference && (
                            <p className="text-xs text-gray-500 mt-0.5">Ref: {transaction.reference}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center w-fit gap-1 border ${getTransactionColor(transaction.type)}`}
                        >
                          {getTypeName(transaction.type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {transaction.balanceBefore.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(transaction.points).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {transaction.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma movimentação encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Elemento de trigger para scroll infinito */}
      <div ref={ref} className="py-8 flex justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
            Carregando mais registros...
          </div>
        ) : hasNextPage ? (
          <div className="text-xs text-gray-400 bg-gray-50/50 px-3 py-1 rounded-full border border-dashed border-gray-200">
            Continue rolando para carregar mais
          </div>
        ) : transactions.length > 0 ? (
          <div className="text-xs text-gray-400">
            Fim do extrato • {transactions.length} registros carregados
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PointsExtractContent;
