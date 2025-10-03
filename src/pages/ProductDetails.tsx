import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Interface para o produto
interface Product {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  availability: 'available' | 'limited' | 'unavailable';
  terms: string[];
  validUntil?: string;
}

// Dados mockados dos produtos
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy A54',
    description: 'Smartphone com tela de 6.4 polegadas, câmera tripla de 50MP, 128GB de armazenamento e bateria de 5000mAh. Ideal para quem busca tecnologia e qualidade.',
    points: 15000,
    category: 'Eletrônicos',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    rating: 4.5,
    reviews: 234,
    availability: 'available',
    terms: [
      'Produto novo e lacrado',
      'Garantia de 12 meses',
      'Entrega em até 15 dias úteis',
      'Não é possível trocar por dinheiro'
    ],
    validUntil: '31/12/2024'
  },
  {
    id: '2',
    name: 'Fone de Ouvido Bluetooth JBL',
    description: 'Fone de ouvido sem fio com cancelamento de ruído, bateria de 30 horas e qualidade de som premium. Perfeito para música e chamadas.',
    points: 8500,
    category: 'Áudio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.3,
    reviews: 156,
    availability: 'available',
    terms: [
      'Produto novo e lacrado',
      'Garantia de 12 meses',
      'Entrega em até 10 dias úteis',
      'Inclui cabo USB-C'
    ],
    validUntil: '30/11/2024'
  },
  {
    id: '3',
    name: 'Smartwatch Apple Watch SE',
    description: 'Relógio inteligente com GPS, monitoramento de saúde, resistente à água e compatível com iPhone. Acompanhe sua rotina com estilo.',
    points: 25000,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    rating: 4.7,
    reviews: 89,
    availability: 'limited',
    terms: [
      'Produto novo e lacrado',
      'Garantia de 12 meses Apple',
      'Entrega em até 20 dias úteis',
      'Compatível apenas com iPhone'
    ],
    validUntil: '15/01/2025'
  }
];

/**
 * Componente da página de detalhes do produto
 * Exibe informações completas do produto e permite resgate direto
 */
const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Dados mockados do usuário
  const userPoints = 18500;

  // Buscar produto pelos dados mockados
  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-4">O produto que você está procurando não existe.</p>
          <button
            onClick={() => navigate('/loja-oi')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Voltar à loja
          </button>
        </div>
      </div>
    );
  }

  /**
   * Função para processar o resgate do produto
   */
  const handleRedeem = async () => {
    if (userPoints < product.points) {
      toast.error('Pontos insuficientes para resgatar este produto!');
      return;
    }

    if (product.availability === 'unavailable') {
      toast.error('Este produto não está disponível no momento.');
      return;
    }

    setIsRedeeming(true);

    // Simular processamento do resgate
    setTimeout(() => {
      setIsRedeeming(false);
      setShowConfirmation(true);
      toast.success('Produto resgatado com sucesso!');
    }, 2000);
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
              <strong>Pontos utilizados:</strong> {product.points.toLocaleString()}<br />
              <strong>Saldo restante:</strong> {(userPoints - product.points).toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Você receberá um e-mail com os detalhes do resgate e instruções para retirada.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/loja-oi')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continuar comprando
            </button>
            <button
              onClick={() => navigate('/loja-oi/meus-resgates')}
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
              onClick={() => navigate('/loja-oi')}
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
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Avaliação */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} avaliações)
                </span>
              </div>
            </div>

            {/* Pontos necessários */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Pontos necessários</p>
                  <p className="text-3xl font-bold text-green-800">{product.points.toLocaleString()}</p>
                </div>
                <Gift className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Status de disponibilidade */}
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(product.availability)}`}>
                {getAvailabilityText(product.availability)}
              </span>
              {product.validUntil && (
                <span className="text-sm text-gray-500">
                  Válido até {product.validUntil}
                </span>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Termos e condições */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Termos e Condições</h3>
              <ul className="space-y-2">
                {product.terms.map((term, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botão de resgate */}
            <div className="space-y-4">
              {userPoints < product.points && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Pontos insuficientes!</strong><br />
                    Você precisa de mais {(product.points - userPoints).toLocaleString()} pontos para resgatar este produto.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleRedeem}
                disabled={isRedeeming || userPoints < product.points || product.availability === 'unavailable'}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isRedeeming || userPoints < product.points || product.availability === 'unavailable'
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