import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Edit, 
  MessageSquare, 
  Download, 
  RefreshCw,
  Star,
  Gift,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Textarea } from '@/components/ui/textarea';
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

// Interface para histórico de status
interface StatusHistory {
  id: string;
  status: RedemptionStatus;
  comment?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

// Dados mockados para demonstração
const mockRedemption: Redemption = {
  id: 'R001',
  userId: 'U001',
  userName: 'João Silva',
  userEmail: 'joao@email.com',
  userPhone: '(11) 99999-9999',
  productId: 'P001',
  productName: 'Smartphone Samsung Galaxy A54',
  productImage: '/placeholder.svg',
  productCategory: 'Eletrônicos',
  pointsUsed: 15000,
  status: 'confirmed',
  priority: 'medium',
  shippingAddress: {
    street: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    complement: 'Apto 45'
  },
  trackingCode: 'BR123456789SP',
  estimatedDelivery: '2024-02-15T00:00:00Z',
  notes: 'Cliente solicitou entrega no período da manhã',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:20:00Z'
};

const mockStatusHistory: StatusHistory[] = [
  {
    id: 'SH001',
    status: 'processing',
    comment: 'Pedido recebido e em análise',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'SYSTEM',
    createdByName: 'Sistema'
  },
  {
    id: 'SH002',
    status: 'confirmed',
    comment: 'Pedido confirmado. Produto separado para envio.',
    createdAt: '2024-01-16T09:15:00Z',
    createdBy: 'ADMIN_001',
    createdByName: 'Maria Santos'
  },
  {
    id: 'SH003',
    status: 'shipped',
    comment: 'Produto enviado via Correios. Código de rastreamento: BR123456789SP',
    createdAt: '2024-01-18T16:45:00Z',
    createdBy: 'ADMIN_002',
    createdByName: 'Carlos Oliveira'
  }
];

/**
 * Página de detalhes de um resgate específico
 * Exibe informações completas do pedido, histórico e permite ações administrativas
 */
const AdminRedemptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [redemption, setRedemption] = useState<Redemption | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<RedemptionStatus>('processing');
  const [statusComment, setStatusComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Simular carregamento dos dados
  useEffect(() => {
    const loadRedemptionDetails = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (id === 'R001') {
        setRedemption(mockRedemption);
        setStatusHistory(mockStatusHistory);
        setNewStatus(mockRedemption.status);
      } else {
        // Simular resgate não encontrado
        setRedemption(null);
      }
      
      setIsLoading(false);
    };

    loadRedemptionDetails();
  }, [id]);

  // Função para obter o ícone do status
  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Função para obter a cor do status
  const getStatusColor = (status: RedemptionStatus) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter a cor da prioridade
  const getPriorityColor = (priority: RedemptionPriority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Função para atualizar status
  const handleUpdateStatus = async () => {
    if (!redemption || !statusComment.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um comentário para a atualização de status.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingStatus(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar o status do resgate
      const updatedRedemption = { ...redemption, status: newStatus, updatedAt: new Date().toISOString() };
      setRedemption(updatedRedemption);
      
      // Adicionar ao histórico
      const newHistoryEntry: StatusHistory = {
        id: `SH${Date.now()}`,
        status: newStatus,
        comment: statusComment,
        createdAt: new Date().toISOString(),
        createdBy: 'ADMIN_CURRENT',
        createdByName: 'Administrador Atual'
      };
      
      setStatusHistory(prev => [...prev, newHistoryEntry]);
      setStatusComment('');
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para ${REDEMPTION_STATUSES[newStatus].label} com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Função para voltar à lista
  const handleGoBack = () => {
    navigate('/admin/redemptions');
  };

  // Função para baixar comprovante
  const handleDownloadReceipt = () => {
    toast({
      title: "Download iniciado",
      description: "O comprovante está sendo gerado..."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando detalhes do resgate...</span>
        </div>
      </div>
    );
  }

  if (!redemption) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Resgate não encontrado</h2>
            <p className="text-gray-600 text-center">
              O resgate com ID "{id}" não foi encontrado ou você não tem permissão para visualizá-lo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resgate #{redemption.id}</h1>
            <p className="text-muted-foreground">
              Criado em {format(new Date(redemption.createdAt), 'dd/MM/yyyy \\à\\s HH:mm', { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="w-4 h-4 mr-2" />
            Comprovante
          </Button>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contatar Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produto Resgatado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img 
                  src={redemption.productImage} 
                  alt={redemption.productName}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{redemption.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{redemption.productCategory}</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {redemption.pointsUsed.toLocaleString()} pontos
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Dados Pessoais</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{redemption.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{redemption.userEmail}</span>
                    </div>
                    {redemption.userPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{redemption.userPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Endereço de Entrega</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="text-sm">
                      <p>{redemption.shippingAddress.street}</p>
                      {redemption.shippingAddress.complement && (
                        <p>{redemption.shippingAddress.complement}</p>
                      )}
                      <p>{redemption.shippingAddress.neighborhood}</p>
                      <p>{redemption.shippingAddress.city} - {redemption.shippingAddress.state}</p>
                      <p>CEP: {redemption.shippingAddress.zipCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Status
              </CardTitle>
              <CardDescription>
                Acompanhe todas as atualizações do pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                      </div>
                      {index < statusHistory.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(entry.status)}>
                          {REDEMPTION_STATUSES[entry.status].label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{entry.comment}</p>
                      <p className="text-xs text-gray-500">Por: {entry.createdByName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(redemption.status)}>
                    {getStatusIcon(redemption.status)}
                    <span className="ml-1">{REDEMPTION_STATUSES[redemption.status].label}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prioridade:</span>
                  <Badge variant={getPriorityColor(redemption.priority)}>
                    <Star className="w-3 h-3 mr-1" />
                    {REDEMPTION_PRIORITIES[redemption.priority].label}
                  </Badge>
                </div>
                
                {redemption.trackingCode && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Código de Rastreamento:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {redemption.trackingCode}
                      </code>
                      <Button size="sm" variant="outline">
                        <Truck className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {redemption.estimatedDelivery && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Previsão de Entrega:</span>
                    <p className="text-sm">
                      {format(new Date(redemption.estimatedDelivery), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Atualizar Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Atualizar Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Novo Status</label>
                  <Select value={newStatus} onValueChange={(value: RedemptionStatus) => setNewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REDEMPTION_STATUSES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(key as RedemptionStatus)}
                            {value.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comentário *</label>
                  <Textarea
                    placeholder="Descreva a atualização do status..."
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={isUpdatingStatus || !statusComment.trim()}
                  className="w-full"
                >
                  {isUpdatingStatus ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {isUpdatingStatus ? 'Atualizando...' : 'Atualizar Status'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {redemption.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{redemption.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRedemptionDetails;