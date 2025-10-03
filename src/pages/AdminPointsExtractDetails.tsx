import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  User, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Download, 
  Eye, 
  Plus, 
  Minus, 
  CreditCard, 
  Package, 
  Clock, 
  Info,
  History,
  Target
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
import { toast } from '@/hooks/use-toast';
import { 
  PointsExtract, 
  PointsTransactionType,
  POINTS_TRANSACTION_TYPES 
} from '@/types/redemptions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para transações relacionadas
interface RelatedTransaction {
  id: string;
  type: PointsTransactionType;
  points: number;
  description: string;
  createdAt: string;
  reference?: string;
}

// Interface para informações do usuário
interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  memberSince: string;
}

// Dados mockados para demonstração
const mockExtract: PointsExtract = {
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
};

const mockUserInfo: UserInfo = {
  id: 'U001',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-9999',
  currentBalance: 10000,
  totalEarned: 45000,
  totalRedeemed: 35000,
  memberSince: '2023-06-15T00:00:00Z'
};

const mockRelatedTransactions: RelatedTransaction[] = [
  {
    id: 'PE002',
    type: 'earned',
    points: 800,
    description: 'Compra realizada - Pedido #12344',
    createdAt: '2024-01-10T14:20:00Z',
    reference: 'ORDER_12344'
  },
  {
    id: 'PE003',
    type: 'bonus',
    points: 1000,
    description: 'Bônus de indicação de amigo',
    createdAt: '2024-01-08T11:15:00Z'
  },
  {
    id: 'PE004',
    type: 'redeemed',
    points: -5000,
    description: 'Resgate: Fone de Ouvido Bluetooth',
    createdAt: '2024-01-05T16:30:00Z',
    reference: 'R003'
  }
];

/**
 * Página de detalhes de um extrato de pontos específico
 * Exibe informações completas da transação, dados do usuário e histórico relacionado
 */
const AdminPointsExtractDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [extract, setExtract] = useState<PointsExtract | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [relatedTransactions, setRelatedTransactions] = useState<RelatedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento dos dados
  useEffect(() => {
    const loadExtractDetails = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (id === 'PE001') {
        setExtract(mockExtract);
        setUserInfo(mockUserInfo);
        setRelatedTransactions(mockRelatedTransactions);
      } else {
        // Simular extrato não encontrado
        setExtract(null);
      }
      
      setIsLoading(false);
    };

    loadExtractDetails();
  }, [id]);

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

  // Função para obter a cor do tipo
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

  // Função para voltar à lista
  const handleGoBack = () => {
    navigate('/admin/points-extracts');
  };

  // Função para visualizar usuário
  const handleViewUser = () => {
    if (userInfo) {
      toast({
        title: "Navegar para usuário",
        description: `Abrindo perfil de ${userInfo.name}`,
      });
    }
  };

  // Função para visualizar referência
  const handleViewReference = (reference: string) => {
    if (reference.startsWith('ORDER')) {
      toast({
        title: "Navegar para pedido",
        description: `Abrindo pedido ${reference}`,
      });
    } else if (reference.startsWith('R')) {
      toast({
        title: "Navegar para resgate",
        description: `Abrindo resgate ${reference}`,
      });
    }
  };

  // Função para baixar comprovante
  const handleDownloadReceipt = () => {
    toast({
      title: "Download iniciado",
      description: "O comprovante da transação está sendo gerado..."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando detalhes da transação...</span>
        </div>
      </div>
    );
  }

  if (!extract) {
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
            <h2 className="text-xl font-semibold mb-2">Transação não encontrada</h2>
            <p className="text-gray-600 text-center">
              A transação com ID "{id}" não foi encontrada ou você não tem permissão para visualizá-la.
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
            <h1 className="text-3xl font-bold tracking-tight">Transação #{extract.id}</h1>
            <p className="text-muted-foreground">
              {format(new Date(extract.createdAt), 'dd/MM/yyyy \\à\\s HH:mm', { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="w-4 h-4 mr-2" />
            Comprovante
          </Button>
          <Button variant="outline" onClick={handleViewUser}>
            <User className="w-4 h-4 mr-2" />
            Ver Usuário
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes da Transação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes da Transação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Transação</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getTransactionIcon(extract.type)}
                      <Badge variant={getTypeColor(extract.type)}>
                        {POINTS_TRANSACTION_TYPES[extract.type].label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pontos</label>
                    <div className={`flex items-center gap-2 mt-1 text-lg font-semibold ${
                      extract.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {extract.points > 0 ? (
                        <Plus className="w-5 h-5" />
                      ) : (
                        <Minus className="w-5 h-5" />
                      )}
                      {Math.abs(extract.points).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                    <p className="mt-1 text-sm">{extract.description}</p>
                  </div>
                  
                  {extract.reference && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Referência</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {extract.reference}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewReference(extract.reference!)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Saldo Anterior</label>
                    <p className="mt-1 text-lg font-semibold">
                      {extract.balanceBefore.toLocaleString()} pontos
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Saldo Atual</label>
                    <p className="mt-1 text-lg font-semibold text-blue-600">
                      {extract.balanceAfter.toLocaleString()} pontos
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data da Transação</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {format(new Date(extract.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  {extract.expirationDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Expiração</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">
                          {format(new Date(extract.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transações Relacionadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transações Relacionadas
              </CardTitle>
              <CardDescription>
                Outras movimentações recentes do mesmo usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <History className="w-8 h-8 text-gray-400" />
                            <p className="text-gray-500">Nenhuma transação relacionada encontrada</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      relatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge variant={getTypeColor(transaction.type)} className="flex items-center gap-1 w-fit">
                              {getTransactionIcon(transaction.type)}
                              {POINTS_TRANSACTION_TYPES[transaction.type].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 font-medium ${
                              transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points > 0 ? (
                                <Plus className="w-4 h-4" />
                              ) : (
                                <Minus className="w-4 h-4" />
                              )}
                              {Math.abs(transaction.points).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm truncate" title={transaction.description}>
                                {transaction.description}
                              </p>
                              {transaction.reference && (
                                <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/admin/points-extracts/${transaction.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Usuário */}
          {userInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">{userInfo.name}</h3>
                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                    {userInfo.phone && (
                      <p className="text-sm text-gray-600">{userInfo.phone}</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Saldo Atual:</span>
                      <span className="font-semibold text-blue-600">
                        {userInfo.currentBalance.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Ganho:</span>
                      <span className="font-semibold text-green-600">
                        {userInfo.totalEarned.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Resgatado:</span>
                      <span className="font-semibold text-red-600">
                        {userInfo.totalRedeemed.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Membro desde:</span>
                      <span className="text-sm">
                        {format(new Date(userInfo.memberSince), 'MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <Button onClick={handleViewUser} className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Ver Perfil Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo da Transação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ID da Transação:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {extract.id}
                  </code>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Impacto no Saldo:</span>
                  <span className={`font-semibold ${
                    extract.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {extract.points > 0 ? '+' : ''}{extract.points.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Variação:</span>
                  <span className="font-semibold">
                    {extract.balanceBefore.toLocaleString()} → {extract.balanceAfter.toLocaleString()}
                  </span>
                </div>
                
                {extract.expirationDate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Pontos com Expiração</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Estes pontos expiram em {format(new Date(extract.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Comprovante
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
                
                {extract.reference && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleViewReference(extract.reference!)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Referência
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPointsExtractDetails;