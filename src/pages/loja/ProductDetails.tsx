import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Gift, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProductBySlug, useRedeemProduct } from '@/hooks/products';
import { ProductRedemptionResponse } from '@/types/products';
import { zerofill } from '@/lib/qlib';
import { PointsStoreProps } from '@/types/products';

/**
 * Componente da página de detalhes do produto
 * Exibe informações completas do produto e permite resgate direto
 */
const ProductDetails: React.FC<PointsStoreProps> = ({ linkLoja }) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  console.log('linkloja', linkLoja);

  // Buscar produto pela API usando slug
  const { data: product, isLoading, error } = useProductBySlug(productId || '');
  const userPoints:number = product?.user?.points_saldo || 0;

  // Hook para resgate de produto - deve estar antes dos returns condicionais
  const redeemMutation = useRedeemProduct({
    onSuccess: (data: ProductRedemptionResponse) => {
      setIsRedeeming(false);
      setShowConfirmation(true);
      toast.success(`Resgate processado com sucesso! #R${zerofill(data.redemption_id, 3)}`);
      console.log('Dados do resgate:', {
        redemptionId: data.redemption_id,
        productName: data.product_name,
        quantity: data.quantity,
        pointsUsed: data.points_used,
        remainingPoints: data.remaining_points,
        status: data.status,
        estimatedDelivery: data.estimated_delivery
      });
    },
    onError: (error: any) => {
      setIsRedeeming(false);
      toast.error(error?.message || 'Erro ao resgatar produto. Tente novamente.');
    }
  });
 
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando produto...</h2>
          <p className="text-gray-600">Aguarde enquanto buscamos as informações do produto.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Erro ao carregar o produto. Tente novamente mais tarde.' : 'O produto que você está procurando não existe ou foi removido.'}
          </p>
          <button
            onClick={() => navigate(linkLoja)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Voltar à Loja
          </button>
        </div>
      </div>
    );
  }



  /**
   * Função para processar o resgate do produto
   */
  const handleRedeem = async () => {
    if (userPoints < (product.pointsRequired || 0)) {
      toast.error('Pontos insuficientes para resgatar este produto!');
      return;
    }

    if (!product.isActive) {
      toast.error('Este produto não está disponível no momento.');
      return;
    }

    setIsRedeeming(true);
    
    // Fazer requisição para a API de resgate
    redeemMutation.mutate({
      productId: product.id,
      quantity: 1
    });
  };

  /**
   * Renderizar estrelas de avaliação
   */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  /**
   * Obter cor do status de disponibilidade
   */
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'limited':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Obter texto do status de disponibilidade
   */
  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Disponível';
      case 'limited':
        return 'Estoque limitado';
      case 'unavailable':
        return 'Indisponível';
      default:
        return 'Desconhecido';
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resgate Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Seu produto <strong>{product.name}</strong> foi resgatado com sucesso.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Pontos utilizados:</strong> {(product.pointsRequired || 0).toLocaleString()}<br />
              <strong>Saldo restante:</strong> {(userPoints - (product.pointsRequired || 0)).toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Você receberá um e-mail com os detalhes do resgate e instruções para retirada.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(linkLoja)}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continuar comprando
            </button>
            <button
              onClick={() => navigate(linkLoja+'/meus-resgates')}
              className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Ver meus resgates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(linkLoja)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar à loja
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Seus pontos</p>
                <p className="text-lg font-bold text-green-600">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagem do produto */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            {/* Título e categoria */}
            <div>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                {product.category?.name || 'Categoria'}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Avaliação */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(4.5)}
                </div>
                <span className="text-sm text-gray-600">
                  4.5 (0 avaliações)
                </span>
              </div>
            </div>

            {/* Pontos necessários */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Pontos necessários</p>
                  <p className="text-3xl font-bold text-green-800">{product.pointsRequired?.toLocaleString() || '0'}</p>
                </div>
                <Gift className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Status de disponibilidade */}
            {/* <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(product.isActive ? 'available' : 'unavailable')}`}>
                {getAvailabilityText(product.isActive ? 'available' : 'unavailable')}
              </span>
              {product.expiresAt && (
                <span className="text-sm text-gray-500">
                  Válido até {new Date(product.expiresAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div> */}

            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <div 
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Termos e condições */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Termos e Condições</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Produto sujeito à disponibilidade</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Resgate não pode ser cancelado após confirmação</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Entrega conforme disponibilidade</span>
                </li>
              </ul>
            </div>

            {/* Botão de resgate */}
            <div className="space-y-4">
              {userPoints < (product.pointsRequired || 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Pontos insuficientes!</strong><br />
                    Você precisa de mais {((product.pointsRequired || 0) - userPoints).toLocaleString()} pontos para resgatar este produto.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleRedeem}
                disabled={isRedeeming || userPoints < (product.pointsRequired || 0) || !product.isActive}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isRedeeming || userPoints < (product.pointsRequired || 0) || !product.isActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isRedeeming ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando resgate...</span>
                  </div>
                ) : (
                  'Resgatar agora'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;