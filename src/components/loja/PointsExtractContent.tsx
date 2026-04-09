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
  Loader2,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { pointsExtractsService } from '@/services/pointsExtractsService';
import { useQuery } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Info, AlertCircle, MoreHorizontal, Eye } from 'lucide-react';

interface PointsExtractContentProps {
  linkLoja?: string;
  adminClientId?: string;
}

const PointsExtractContent: React.FC<PointsExtractContentProps> = ({ linkLoja = '/lojaderesgatesantenamais', adminClientId }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = React.useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  
  // Estados para o Modal de Detalhes do Crédito (Transparência)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);

  // Busca detalhes do crédito selecionado
  const { data: creditDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['creditDetails', selectedCreditId, adminClientId],
    queryFn: () => pointsExtractsService.getCreditDetails(selectedCreditId!, adminClientId),
    enabled: !!selectedCreditId && isDetailsModalOpen,
  });

  const handleOpenCreditDetails = (creditId: string) => {
    setSelectedCreditId(creditId);
    setIsDetailsModalOpen(true);
  };

  /**
   * Identifica IDs de créditos em descrições e os transforma em links clicáveis
   */
  const renderDescription = (description: string) => {
    if (!description) return null;
    
    // Regex para encontrar # seguido de números
    const regex = /#(\d+)/g;
    const matches = [...description.matchAll(regex)];
    
    if (matches.length === 0) return <span>{description}</span>;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      const fullMatch = match[0];
      const creditId = match[1];
      const matchStart = match.index!;
      
      // Adiciona o texto antes do match
      if (matchStart > lastIndex) {
        elements.push(description.slice(lastIndex, matchStart));
      }
      
      // Adiciona o link
      elements.push(
        <button
          key={`${creditId}-${index}`}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCreditDetails(creditId);
          }}
          className="text-blue-600 hover:text-blue-800 font-bold underline decoration-dotted underline-offset-2 mx-0.5 hover:bg-blue-50 px-0.5 rounded transition-colors"
          title={`Ver detalhes do crédito #${creditId}`}
        >
          {fullMatch}
        </button>
      );
      
      lastIndex = matchStart + fullMatch.length;
    });
    
    // Adiciona o restante do texto
    if (lastIndex < description.length) {
      elements.push(description.slice(lastIndex));
    }
    
    return <span>{elements}</span>;
  };

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
    per_page: 20,
    ...(adminClientId ? { admin_client_id: adminClientId } : {})
  }, {
    placeholderData: (previousData: any) => previousData,
    staleTime: 0,
  });

  const { data: balanceData, isLoading: isLoadingBalance } = useAuthenticatedUserPointsBalance({
    search: debouncedSearch,
    dateFrom,
    dateTo,
    ...(adminClientId ? { admin_client_id: adminClientId } : {})
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
    active_points: 0,
    total_transactions: 0,
    expired_points: 0,
    points_expiring_soon: 0
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for Expiring Points */}
      {stats.points_expiring_soon > 0 && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg shrink-0 h-fit">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <AlertTitle className="text-amber-800 font-bold text-lg mb-1">
                  Atenção: Pontos a Expirar
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Você possui <span className="font-bold text-amber-900">{Math.floor(stats.points_expiring_soon).toLocaleString()} pontos</span> que vão expirar nos próximos 30 dias. 
                  Não deixe para a última hora! 
                </AlertDescription>
              </div>
            </div>
            {!adminClientId && (
              <Button 
                onClick={() => navigate(linkLoja)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-6 py-6 h-auto shadow-md transform hover:scale-105 transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Trocar Pontos Agora
              </Button>
            )}
          </div>
        </Alert>
      )}

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
          <Button
            variant={type === 'expired' ? 'default' : 'outline'}
            onClick={() => setType('expired')}
            size="sm"
            className={type === 'expired' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Expirados
          </Button>
        </div>
      </div>

      {/* Transactions List - Responsive Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Saldo Anterior</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Pontos</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Saldo Disp.</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Validade</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Saldo Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingExtract && !extractInfiniteData ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
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
                          <p className="font-medium">{renderDescription(transaction.description || (transaction.type === 'expired' ? 'Expiração de Pontos' : 'Movimentação de Pontos'))}</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {isPositive ? (
                          <button 
                            onClick={() => handleOpenCreditDetails(String(transaction.id))}
                            className="flex flex-col items-end w-full hover:opacity-75 transition-opacity group"
                            title="Clique para ver detalhes do consumo"
                          >
                            <span className={`font-bold underline underline-offset-2 decoration-dotted ${(transaction.saldo_restante ?? 0) > 0 ? 'text-blue-600 decoration-blue-300' : 'text-gray-400 decoration-gray-200'}`}>
                              {(transaction.saldo_restante ?? 0).toLocaleString()}
                            </span>
                            {(transaction.valor_usado ?? 0) > 0 && (
                              <span className="text-[10px] text-gray-400 group-hover:text-blue-500">
                                Uso: {(transaction.valor_usado ?? 0).toLocaleString()}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {isPositive && transaction.expirationDate ? (
                          <div className="flex flex-col items-end">
                            {(() => {
                              const days = Math.ceil((new Date(transaction.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                              const isExpired = days <= 0;
                              return (
                                <>
                                  <div className={`flex items-center text-xs ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(transaction.expirationDate).toLocaleDateString('pt-BR')}
                                  </div>
                                  {isExpired ? (
                                    <Badge className="mt-1 bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[10px] h-5 px-1.5 py-0">
                                      Expirado
                                    </Badge>
                                  ) : (days <= 30) ? (
                                    <Badge className="mt-1 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] h-5 px-1.5 py-0">
                                      Expira em {days}d
                                    </Badge>
                                  ) : null}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {transaction.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma movimentação encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (Visible only on small screens) */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoadingExtract && !extractInfiniteData ? (
            <div className="px-6 py-12 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                Carregando...
              </div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => {
              const isPositive = transaction.points > 0;
              return (
                <div key={transaction.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(transaction.createdAt)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 border text-[10px] h-5 px-1.5 ${getTransactionColor(transaction.type)}`}
                    >
                      {getTypeName(transaction.type)}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {transaction.description || (transaction.type === 'expired' ? 'Expiração de Pontos' : 'Movimentação de Pontos')}
                    </p>
                    {transaction.reference && (
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">ID: {transaction.reference}</p>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-1">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Saldo após transação</p>
                      <p className="text-sm font-bold text-gray-600">
                        {transaction.balanceAfter.toLocaleString()} pts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(transaction.points).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isPositive && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Saldo Disponível</p>
                        <p className="text-xs font-bold text-blue-600">
                           {(transaction.saldo_restante ?? 0).toLocaleString()} pts
                        </p>
                      </div>
                      {transaction.expirationDate && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Validade</p>
                          {(() => {
                             const days = Math.ceil((new Date(transaction.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                             const isExpired = days <= 0;
                             return (
                               <div className={`flex items-center justify-end text-[10px] font-medium ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                 <Clock className="w-3 h-3 mr-1" />
                                 {new Date(transaction.expirationDate).toLocaleDateString('pt-BR')}
                               </div>
                             );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma movimentação encontrada.</p>
            </div>
          )}
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
      
      {/* Modal de Detalhes do Crédito (Transparência) */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Detalhes do Lançamento
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o crédito original #{selectedCreditId}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Buscando informações...</p>
            </div>
          ) : creditDetails ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-500 font-medium text-xs">Data do Lançamento</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <p className="font-medium">{creditDetails.createdAt ? format(new Date(creditDetails.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}</p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-gray-500 font-medium text-xs">Validade</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="font-medium">{creditDetails.expirationDate ? format(new Date(creditDetails.expirationDate), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-gray-500 font-medium text-xs">Valor Original</p>
                  <p className="text-green-600 font-bold text-lg">
                    + {Math.abs(creditDetails.points).toLocaleString()} pts
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-gray-500 font-medium text-xs">Saldo Atual</p>
                  <p className="text-blue-700 font-bold text-lg">
                    {(creditDetails.saldo_restante ?? 0).toLocaleString()} pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold italic">Resgatado por você</p>
                  <p className="text-gray-700 font-semibold">{creditDetails.valor_resgatado?.toLocaleString() || 0} pts</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold italic">Expirado pelo Sistema</p>
                  <p className={`font-semibold ${creditDetails.valor_expirado! > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {creditDetails.valor_expirado?.toLocaleString() || 0} pts
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400">
                  <span>Fluxo de Pontos</span>
                  <span>{Math.abs(creditDetails.points).toLocaleString()} Total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden shadow-inner">
                  {/* Parte Resgatada (Azul) */}
                  <div 
                    className="bg-blue-600 h-full transition-all" 
                    title={`Resgatado: ${creditDetails.valor_resgatado}`}
                    style={{ width: `${Math.min(100, ((creditDetails.valor_resgatado ?? 0) / Math.abs(creditDetails.points)) * 100)}%` }}
                  ></div>
                  {/* Parte Expirada (Amber) */}
                  <div 
                    className="bg-amber-500 h-full transition-all" 
                    title={`Expirado: ${creditDetails.valor_expirado}`}
                    style={{ width: `${Math.min(100, ((creditDetails.valor_expirado ?? 0) / Math.abs(creditDetails.points)) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex gap-4 mt-1 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Resgatado
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Expirado
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 italic ml-auto">
                    Restante: {creditDetails.saldo_restante} pts
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-sm border-t pt-4">
                <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest">Descrição do Lançamento</p>
                <p className="italic text-gray-700 text-sm">"{creditDetails.description || '—'}"</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p>Não foi possível carregar os detalhes.</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" className="h-8 text-xs" onClick={() => setIsDetailsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PointsExtractContent;
