import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Gift, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useProductBySlug, useRedeemProduct } from '@/hooks/products';
import { ProductRedemptionResponse } from '@/types/products';
import { zerofill } from '@/lib/qlib';
import { PointsStoreProps } from '@/types/products';
import { useCep } from '@/hooks/useCep';

/**
 * Componente da página de detalhes do produto
 * Exibe informações completas do produto e permite resgate direto
 */
const ProductDetails: React.FC<PointsStoreProps> = ({ linkLoja }) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRedemptionForm, setShowRedemptionForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  // console.log('linkloja', linkLoja);

  // Buscar produto pela API usando slug
  const { data: productGet, isLoading, error } = useProductBySlug(productId || '');
  const product:any = productGet || {};
  const userPoints:number = product?.user?.points_saldo || 0;
  const categoryData:any = product?.categoryData || {};
  const categoryId = categoryData?.id || '';
  console.log('categoryData:', categoryData, 'categoryId:', categoryId);
  // Hook para buscar dados do CEP - deve estar antes dos returns condicionais
  const { fetchCep } = useCep();
  
  // console.log('product', product);
  // console.log('categoryId', categoryId);
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
   * Função para iniciar o processo de resgate (exibir formulário)
   */
  const handleStartRedeem = () => {
    if (userPoints < (product.pointsRequired || 0)) {
      toast.error('Pontos insuficientes para resgatar este produto!');
      return;
    }

    if (!product.isActive) {
      toast.error('Este produto não está disponível no momento.');
      return;
    }

    setShowRedemptionForm(true);
    setFormData({});
    setFormErrors({});
  };

  /**
   * Função para processar o resgate do produto com dados do formulário
   */
  const handleRedeem = async () => {
    // Validar formulário
    if (!validateForm()) {
      return;
    }

    setIsRedeeming(true);
    
    // Fazer requisição para a API de resgate com config
    redeemMutation.mutate({
      productId: product.id,
      quantity: 1,
      config: formData
    });
  };

  /**
   * Função para validar o formulário baseado na categoria
   */
  const validateForm = () => {
    const errors: any = {};
    
    if (categoryId === 3 || categoryId === '3') {
      // Validação para formulário PIX
      if (!formData.chave_pix) {
        errors.chave_pix = 'Chave PIX é obrigatória';
      }
      if (!formData.confira_pix) {
        errors.confira_pix = 'Confirmação da chave PIX é obrigatória';
      }
      if (formData.chave_pix && formData.confira_pix && formData.chave_pix !== formData.confira_pix) {
        errors.confira_pix = 'As chaves PIX não coincidem';
      }
    } else {
      // Validação para formulário de endereço
      const requiredFields = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          errors[field] = 'Campo obrigatório';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Função para buscar dados do CEP
   */
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData({ ...formData, cep });
    
    if (cleanCep.length === 8) {
      try {
        const cepData = await fetchCep(cleanCep);
        if (cepData) {
          setFormData({
            ...formData,
            cep,
            logradouro: cepData.endereco || '',
            bairro: cepData.bairro || '',
            cidade: cepData.cidade || '',
            uf: cepData.uf || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  /**
   * Função para aplicar máscara no CEP
   */
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  /**
   * Função para fechar o formulário
   */
  const handleCloseForm = () => {
    setShowRedemptionForm(false);
    setFormData({});
    setFormErrors({});
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
                onClick={handleStartRedeem}
                disabled={userPoints < (product.pointsRequired || 0) || !product.isActive}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  userPoints < (product.pointsRequired || 0) || !product.isActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                Resgatar agora
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal do formulário de resgate */}
      {showRedemptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {(categoryId === 3 || categoryId === '3') ? 'Dados para PIX' : 'Dados para entrega'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6">
              {(categoryId === 3 || categoryId === '3') ? (
                // Formulário PIX
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Instruções importantes:</strong><br />
                      • O PIX será processado em até 2 dias úteis<br />
                      • Verifique se a chave PIX está correta<br />
                      • Não é possível alterar os dados após confirmação
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave PIX *
                    </label>
                    <input
                      type="text"
                      value={formData.chave_pix || ''}
                      onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.chave_pix ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite sua chave PIX"
                    />
                    {formErrors.chave_pix && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.chave_pix}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digite chave PIX novamente *
                    </label>
                    <input
                      type="text"
                      value={formData.confira_pix || ''}
                      onChange={(e) => setFormData({ ...formData, confira_pix: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.confira_pix ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirme sua chave PIX"
                    />
                    {formErrors.confira_pix && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.confira_pix}</p>
                    )}
                  </div>
                </div>
              ) : (
                // Formulário de endereço
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                      </label>
                      <input
                        type="text"
                        value={formData.cep || ''}
                        onChange={(e) => handleCepChange(formatCep(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.cep ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {formErrors.cep && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.cep}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logradouro *
                    </label>
                    <input
                      type="text"
                      value={formData.logradouro || ''}
                      onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.logradouro ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Rua, Avenida, etc."
                    />
                    {formErrors.logradouro && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.logradouro}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número *
                      </label>
                      <input
                        type="text"
                        value={formData.numero || ''}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.numero ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                      />
                      {formErrors.numero && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.numero}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={formData.complemento || ''}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={formData.bairro || ''}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.bairro ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome do bairro"
                    />
                    {formErrors.bairro && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.bairro}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        value={formData.cidade || ''}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.cidade ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nome da cidade"
                      />
                      {formErrors.cidade && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.cidade}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UF *
                      </label>
                      <input
                        type="text"
                        value={formData.uf || ''}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          formErrors.uf ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="SP"
                        maxLength={2}
                      />
                      {formErrors.uf && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.uf}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ponto de referência
                    </label>
                    <input
                      type="text"
                      value={formData.ponto_referencia || ''}
                      onChange={(e) => setFormData({ ...formData, ponto_referencia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Próximo ao shopping, etc."
                    />
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isRedeeming
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRedeeming ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    'Confirmar resgate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;