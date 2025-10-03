import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, Star, Gift, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';

// Interface para o resgate
interface Redemption {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  pointsUsed: number;
  redemptionDate: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  estimatedDelivery?: string;
  category: string;
}

// Dados mockados dos resgates
const mockRedemptions: Redemption[] = [
  {
    id: 'R001',
    productId: '1',
    productName: 'Smartphone Samsung Galaxy A54',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    pointsUsed: 15000,
    redemptionDate: '2024-01-15',
    status: 'delivered',
    trackingCode: 'BR123456789',
    category: 'Eletrônicos'
  },
  {
    id: 'R002',
    productId: '2',
    productName: 'Fone de Ouvido Bluetooth JBL',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    pointsUsed: 8500,
    redemptionDate: '2024-01-20',
    status: 'shipped',
    trackingCode: 'BR987654321',
    estimatedDelivery: '2024-01-25',
    category: 'Áudio'
  },
  {
    id: 'R003',
    productId: '3',
    productName: 'Smartwatch Apple Watch SE',
    productImage: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    pointsUsed: 25000,
    redemptionDate: '2024-01-22',
    status: 'confirmed',
    estimatedDelivery: '2024-02-05',
    category: 'Wearables'
  },
  {
    id: 'R004',
    productId: '1',
    productName: 'Tablet Samsung Galaxy Tab A8',
    productImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    pointsUsed: 12000,
    redemptionDate: '2024-01-10',
    status: 'processing',
    category: 'Eletrônicos'
  }
];

/**
 * Componente da página de histórico de resgates
 * Exibe todos os resgates realizados pelo usuário
 */
const MyRedemptions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dados mockados do usuário
  const userPoints = 18500;
  const totalPointsUsed = mockRedemptions.reduce((total, redemption) => total + redemption.pointsUsed, 0);

  /**
   * Filtrar resgates baseado na busca e filtro de status
   */
  const filteredRedemptions = mockRedemptions.filter(redemption => {
    const matchesSearch = redemption.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         redemption.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /**
   * Obter informações do status
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
        return {
          label: 'Processando',
          color: 'text-yellow-600 bg-yellow-100',
          icon: Clock
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          color: 'text-blue-600 bg-blue-100',
          icon: CheckCircle
        };
      case 'shipped':
        return {
          label: 'Enviado',
          color: 'text-purple-600 bg-purple-100',
          icon: Package
        };
      case 'delivered':
        return {
          label: 'Entregue',
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'text-red-600 bg-red-100',
          icon: XCircle
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'text-gray-600 bg-gray-100',
          icon: Clock
        };
    }
  };

  /**
   * Formatar data
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/loja-oi')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar à loja
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Meus Resgates</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Pontos disponíveis</p>
                <p className="text-lg font-bold text-green-600">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Resgates</p>
                <p className="text-3xl font-bold text-gray-900">{mockRedemptions.length}</p>
              </div>
              <Gift className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pontos Utilizados</p>
                <p className="text-3xl font-bold text-gray-900">{totalPointsUsed.toLocaleString()}</p>
              </div>
              <Star className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Último Resgate</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(mockRedemptions[mockRedemptions.length - 1]?.redemptionDate || '')}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por produto ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtro de status */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todos os status</option>
                <option value="processing">Processando</option>
                <option value="confirmed">Confirmado</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de resgates */}
        <div className="space-y-6">
          {filteredRedemptions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum resgate encontrado</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Você ainda não fez nenhum resgate. Que tal começar agora?'
                }
              </p>
              <button
                onClick={() => navigate('/loja-oi')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Ir às compras
              </button>
            </div>
          ) : (
            filteredRedemptions.map((redemption) => {
              const statusInfo = getStatusInfo(redemption.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={redemption.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Imagem do produto */}
                      <div className="flex-shrink-0">
                        <img
                          src={redemption.productImage}
                          alt={redemption.productName}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      </div>
                      
                      {/* Informações do produto */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{redemption.productName}</h3>
                            <p className="text-sm text-gray-600">{redemption.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Código do Resgate</p>
                            <p className="text-gray-900 font-mono">{redemption.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Data do Resgate</p>
                            <p className="text-gray-900">{formatDate(redemption.redemptionDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Pontos Utilizados</p>
                            <p className="text-gray-900 font-semibold">{redemption.pointsUsed.toLocaleString()}</p>
                          </div>
                          {redemption.trackingCode && (
                            <div>
                              <p className="text-gray-600 font-medium">Código de Rastreamento</p>
                              <p className="text-gray-900 font-mono">{redemption.trackingCode}</p>
                            </div>
                          )}
                        </div>
                        
                        {redemption.estimatedDelivery && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Previsão de entrega:</strong> {formatDate(redemption.estimatedDelivery)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate(`/loja-oi/produto/${redemption.productId}`)}
                        className="flex-1 border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors font-medium"
                      >
                        Ver produto
                      </button>
                      {redemption.trackingCode && (
                        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Rastrear pedido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default MyRedemptions;