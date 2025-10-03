import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Gift
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
  Redemption, 
  RedemptionStatus, 
  RedemptionPriority,
  REDEMPTION_STATUSES,
  REDEMPTION_PRIORITIES 
} from '@/types/redemptions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados mockados para demonstração
const mockRedemptions: Redemption[] = [
  {
    id: 'R001',
    userId: 'U001',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    productId: 'P001',
    productName: 'Smartphone Samsung Galaxy A54',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    productCategory: 'Eletrônicos',
    pointsUsed: 15000,
    redemptionDate: '2024-01-15T10:30:00Z',
    status: 'delivered',
    priority: 'medium',
    trackingCode: 'BR123456789',
    estimatedDelivery: '2024-01-25T00:00:00Z',
    actualDelivery: '2024-01-24T14:30:00Z',
    notes: 'Entrega realizada com sucesso',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-24T14:30:00Z'
  },
  {
    id: 'R002',
    userId: 'U002',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    productId: 'P002',
    productName: 'Fone de Ouvido Bluetooth JBL',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    productCategory: 'Áudio',
    pointsUsed: 8500,
    redemptionDate: '2024-01-20T15:45:00Z',
    status: 'shipped',
    priority: 'high',
    trackingCode: 'BR987654321',
    estimatedDelivery: '2024-01-30T00:00:00Z',
    notes: 'Produto em trânsito',
    createdAt: '2024-01-20T15:45:00Z',
    updatedAt: '2024-01-22T09:15:00Z'
  },
  {
    id: 'R003',
    userId: 'U003',
    userName: 'Pedro Costa',
    userEmail: 'pedro@email.com',
    productId: 'P003',
    productName: 'Smartwatch Apple Watch SE',
    productImage: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    productCategory: 'Wearables',
    pointsUsed: 25000,
    redemptionDate: '2024-01-22T11:20:00Z',
    status: 'confirmed',
    priority: 'medium',
    estimatedDelivery: '2024-02-05T00:00:00Z',
    notes: 'Aguardando separação no estoque',
    createdAt: '2024-01-22T11:20:00Z',
    updatedAt: '2024-01-22T16:30:00Z'
  },
  {
    id: 'R004',
    userId: 'U004',
    userName: 'Ana Oliveira',
    userEmail: 'ana@email.com',
    productId: 'P004',
    productName: 'Tablet Samsung Galaxy Tab A8',
    productImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    productCategory: 'Eletrônicos',
    pointsUsed: 12000,
    redemptionDate: '2024-01-10T09:15:00Z',
    status: 'processing',
    priority: 'urgent',
    notes: 'Cliente solicitou urgência na entrega',
    adminNotes: 'Verificar disponibilidade no estoque principal',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-23T08:45:00Z'
  },
  {
    id: 'R005',
    userId: 'U005',
    userName: 'Carlos Ferreira',
    userEmail: 'carlos@email.com',
    productId: 'P005',
    productName: 'Cafeteira Elétrica Premium',
    productImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    productCategory: 'Casa & Decoração',
    pointsUsed: 5500,
    redemptionDate: '2024-01-18T14:00:00Z',
    status: 'cancelled',
    priority: 'low',
    notes: 'Produto fora de estoque - cancelado pelo sistema',
    adminNotes: 'Pontos reembolsados automaticamente',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-19T10:30:00Z'
  }
];

/**
 * Página administrativa para acompanhamento de resgates da loja de pontos
 * Permite visualizar, filtrar e gerenciar todos os pedidos de resgate
 */
const AdminRedemptions: React.FC = () => {
  const navigate = useNavigate();
  const [redemptions] = useState<Redemption[]>(mockRedemptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

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

  // Função para obter a cor do badge de prioridade
  const getPriorityColor = (priority?: RedemptionPriority) => {
    if (!priority) return 'secondary';
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Filtrar resgates baseado nos filtros aplicados
  const filteredRedemptions = useMemo(() => {
    return redemptions.filter(redemption => {
      const matchesSearch = 
        redemption.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        redemption.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || redemption.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || redemption.productCategory === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [redemptions, searchTerm, statusFilter, priorityFilter, categoryFilter]);

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

  // Função para atualizar status do resgate
  const handleStatusUpdate = (redemptionId: string, newStatus: RedemptionStatus) => {
    // Aqui seria feita a chamada para a API
    toast({
      title: "Status atualizado",
      description: `Status do resgate ${redemptionId} foi atualizado para ${REDEMPTION_STATUSES[newStatus].label}.`,
    });
  };

  // Função para visualizar detalhes do resgate
  const handleViewDetails = (redemptionId: string) => {
    navigate(`/admin/redemptions/${redemptionId}`);
  };

  // Função para exportar dados
  const handleExport = () => {
    toast({
      title: "Exportando dados",
      description: "Os dados dos resgates estão sendo exportados...",
    });
  };

  // Obter categorias únicas para o filtro
  const categories = Array.from(new Set(redemptions.map(r => r.productCategory)));

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resgates da Loja de Pontos</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todos os resgates realizados pelos clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsLoading(!isLoading)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
                  placeholder="Nome, email, produto ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  {Object.entries(REDEMPTION_PRIORITIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                          variant={redemption.status === 'delivered' ? 'default' : 
                                  redemption.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(redemption.status)}
                          {REDEMPTION_STATUSES[redemption.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {redemption.priority && (
                          <Badge variant={getPriorityColor(redemption.priority)}>
                            {REDEMPTION_PRIORITIES[redemption.priority].label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {redemption.estimatedDelivery && (
                          <span className="text-sm">
                            {format(new Date(redemption.estimatedDelivery), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(redemption.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(redemption.id, 'confirmed')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(redemption.id, 'shipped')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Marcar como enviado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(redemption.id, 'delivered')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como entregue
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(redemption.id, 'cancelled')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRedemptions;