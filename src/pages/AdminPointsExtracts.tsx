import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  User,
  DollarSign,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados mockados para demonstração
const mockPointsExtracts: PointsExtract[] = [
  {
    id: 'PE001',
    userId: 'U001',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    type: 'earned',
    points: 1500,
    description: 'Compra realizada - Pedido #12345',
    reference: 'ORDER_12345',
    balanceBefore: 8500,
    balanceAfter: 10000,
    expirationDate: '2025-01-15T00:00:00Z',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'PE002',
    userId: 'U001',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    type: 'redeemed',
    points: -15000,
    description: 'Resgate: Smartphone Samsung Galaxy A54',
    reference: 'R001',
    balanceBefore: 25000,
    balanceAfter: 10000,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'PE003',
    userId: 'U002',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    type: 'bonus',
    points: 2000,
    description: 'Bônus de aniversário',
    balanceBefore: 5500,
    balanceAfter: 7500,
    expirationDate: '2025-01-20T00:00:00Z',
    createdAt: '2024-01-20T15:45:00Z',
    createdBy: 'ADMIN_001'
  },
  {
    id: 'PE004',
    userId: 'U003',
    userName: 'Pedro Costa',
    userEmail: 'pedro@email.com',
    type: 'earned',
    points: 3200,
    description: 'Compra realizada - Pedido #12346',
    reference: 'ORDER_12346',
    balanceBefore: 12800,
    balanceAfter: 16000,
    expirationDate: '2025-01-22T00:00:00Z',
    createdAt: '2024-01-22T11:20:00Z'
  },
  {
    id: 'PE005',
    userId: 'U004',
    userName: 'Ana Oliveira',
    userEmail: 'ana@email.com',
    type: 'expired',
    points: -800,
    description: 'Pontos expirados - Lote #2023-12',
    balanceBefore: 3800,
    balanceAfter: 3000,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'PE006',
    userId: 'U005',
    userName: 'Carlos Ferreira',
    userEmail: 'carlos@email.com',
    type: 'refund',
    points: 5500,
    description: 'Reembolso: Cafeteira Elétrica Premium',
    reference: 'R005',
    balanceBefore: 2000,
    balanceAfter: 7500,
    createdAt: '2024-01-19T10:30:00Z'
  },
  {
    id: 'PE007',
    userId: 'U006',
    userName: 'Lucia Mendes',
    userEmail: 'lucia@email.com',
    type: 'adjustment',
    points: 1000,
    description: 'Ajuste manual - Correção de saldo',
    balanceBefore: 4500,
    balanceAfter: 5500,
    createdAt: '2024-01-23T14:15:00Z',
    createdBy: 'ADMIN_002'
  }
];

/**
 * Página administrativa para acompanhamento de extratos de pontos
 * Permite visualizar, filtrar e gerenciar todas as movimentações de pontos
 */
const AdminPointsExtracts: React.FC = () => {
  const navigate = useNavigate();
  const [extracts] = useState<PointsExtract[]>(mockPointsExtracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função para obter o ícone do tipo de transação
  const getTransactionIcon = (type: PointsTransactionType) => {
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

  // Filtrar extratos baseado nos filtros aplicados
  const filteredExtracts = useMemo(() => {
    return extracts.filter(extract => {
      const matchesSearch = 
        extract.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extract.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extract.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || extract.type === typeFilter;
      
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const extractDate = new Date(extract.createdAt);
        if (dateFromFilter) {
          matchesDateRange = matchesDateRange && extractDate >= new Date(dateFromFilter);
        }
        if (dateToFilter) {
          matchesDateRange = matchesDateRange && extractDate <= new Date(dateToFilter + 'T23:59:59');
        }
      }
      
      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [extracts, searchTerm, typeFilter, dateFromFilter, dateToFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalTransactions = extracts.length;
    const totalEarned = extracts
      .filter(e => ['earned', 'bonus', 'refund', 'adjustment'].includes(e.type) && e.points > 0)
      .reduce((sum, e) => sum + e.points, 0);
    const totalRedeemed = extracts
      .filter(e => e.type === 'redeemed')
      .reduce((sum, e) => sum + Math.abs(e.points), 0);
    const totalExpired = extracts
      .filter(e => e.type === 'expired')
      .reduce((sum, e) => sum + Math.abs(e.points), 0);
    const activeUsers = new Set(extracts.map(e => e.userId)).size;
    
    return { totalTransactions, totalEarned, totalRedeemed, totalExpired, activeUsers };
  }, [extracts]);

  // Função para visualizar detalhes do extrato
  const handleViewDetails = (extractId: string) => {
    navigate(`/admin/points-extracts/${extractId}`);
  };

  // Função para exportar dados
  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "Os dados dos extratos estão sendo exportados...",
    });
  };

  // Função para criar ajuste manual
  const handleCreateAdjustment = () => {
    toast({
      title: "Criar ajuste",
      description: "Abrindo formulário para criar ajuste manual de pontos...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extratos de Pontos</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as movimentações de pontos dos clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleCreateAdjustment}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Ajuste
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
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
              <p className="text-2xl font-bold text-purple-600">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Tabela de Extratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Extratos de Pontos ({filteredExtracts.length})
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Saldo Anterior</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExtracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">Nenhuma movimentação encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExtracts.map((extract) => (
                    <TableRow key={extract.id}>
                      <TableCell className="font-medium">{extract.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{extract.userName}</span>
                          <span className="text-sm text-gray-500">{extract.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(extract.type)} className="flex items-center gap-1 w-fit">
                          {getTransactionIcon(extract.type)}
                          {POINTS_TRANSACTION_TYPES[extract.type].label}
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
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={extract.description}>
                            {extract.description}
                          </p>
                          {extract.reference && (
                            <p className="text-xs text-gray-500">Ref: {extract.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {extract.balanceBefore.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {extract.balanceAfter.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(extract.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        {extract.expirationDate && (
                          <div className="text-xs text-gray-500">
                            Expira: {format(new Date(extract.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
                            {extract.reference && (
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
                            )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPointsExtracts;