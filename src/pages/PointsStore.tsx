import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Gift, User, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

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

interface User {
  name: string;
  points: number;
  avatar: string;
}

/**
 * Componente da loja virtual de clube de pontos Yellow
 * Interface pública para resgate de produtos com pontos
 */
const PointsStore: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<number[]>([]);

  // Dados mockados do usuário
  const user: User = {
    name: 'João Silva',
    points: 15420,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };

  // Produtos mockados
  const products: Product[] = [
    {
      id: '1',
      name: 'Smartphone Samsung Galaxy A54',
      description: 'Smartphone com tela de 6.4" e câmera de 50MP',
      points: 12000,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      category: 'electronics',
      rating: 4.5,
      reviews: 234,
      availability: 'available',
      terms: ['Produto novo e lacrado', 'Garantia de 12 meses', 'Entrega em até 15 dias úteis'],
      validUntil: '31/12/2024'
    },
    {
      id: '2',
      name: 'Fone de Ouvido Bluetooth',
      description: 'Fone wireless com cancelamento de ruído',
      points: 3500,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'electronics',
      rating: 4.8,
      reviews: 156,
      availability: 'available',
      terms: ['Produto novo e lacrado', 'Garantia de 12 meses', 'Entrega em até 10 dias úteis'],
      validUntil: '30/11/2024'
    },
    {
      id: '3',
      name: 'Cafeteira Elétrica Premium',
      description: 'Cafeteira automática com moedor integrado',
      points: 5500,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
      category: 'home',
      rating: 4.3,
      reviews: 89,
      availability: 'available',
      terms: ['Produto novo e lacrado', 'Garantia de 24 meses', 'Entrega em até 12 dias úteis'],
      validUntil: '15/01/2025'
    },
    {
      id: '4',
      name: 'Tênis Esportivo Nike',
      description: 'Tênis para corrida com tecnologia Air Max',
      points: 4200,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      category: 'fashion',
      rating: 4.7,
      reviews: 67,
      availability: 'unavailable',
      terms: ['Produto novo e lacrado', 'Garantia de 6 meses', 'Entrega em até 20 dias úteis'],
      validUntil: '28/02/2025'
    },
    {
      id: '5',
      name: 'Voucher Viagem - Hotel 5 Estrelas',
      description: 'Voucher para 2 diárias em hotel de luxo',
      points: 8000,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=300&fit=crop',
      category: 'travel',
      rating: 5.0,
      reviews: 45,
      availability: 'limited',
      terms: ['Válido por 12 meses', 'Sujeito à disponibilidade', 'Não reembolsável'],
      validUntil: '31/12/2025'
    },
    {
      id: '6',
      name: 'Smart TV 55" 4K',
      description: 'Smart TV LED 55 polegadas com resolução 4K',
      points: 18000,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
      category: 'electronics',
      rating: 4.6,
      reviews: 123,
      availability: 'available',
      terms: ['Produto novo e lacrado', 'Garantia de 12 meses', 'Entrega em até 25 dias úteis'],
      validUntil: '30/06/2025'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: '🛍️' },
    { id: 'electronics', name: 'Eletrônicos', icon: '📱' },
    { id: 'home', name: 'Casa & Decoração', icon: '🏠' },
    { id: 'fashion', name: 'Moda', icon: '👕' },
    { id: 'travel', name: 'Viagens', icon: '✈️' }
  ];

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Função para resgatar produto
  const handleRedeem = (product: Product) => {
    if (product.availability === 'unavailable') {
      toast({
        title: "Produto indisponível",
        description: "Este produto está temporariamente fora de estoque.",
        variant: "destructive"
      });
      return;
    }

    if (user.points < product.points) {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${product.points - user.points} pontos a mais para resgatar este produto.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Produto resgatado com sucesso!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
      variant: "default"
    });

    setCartItems([...cartItems, product.id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/oi-logo.svg" 
                alt="oi tv logo" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oi TV</h1>
                <p className="text-xs text-gray-500">Clube de Pontos</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-green-600 transition-colors">Início</a>
              <a href="#products" className="text-gray-700 hover:text-green-600 transition-colors">Produtos</a>
              <a href="#categories" className="text-gray-700 hover:text-green-600 transition-colors">Categorias</a>
              <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors">Sobre</a>
            </nav>

            {/* User Info & Cart */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">{user.points.toLocaleString()} pts</span>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>

              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">{user.points.toLocaleString()} pontos</span>
              </div>
              <a href="#home" className="block py-2 text-gray-700">Início</a>
              <a href="#products" className="block py-2 text-gray-700">Produtos</a>
              <a href="#categories" className="block py-2 text-gray-700">Categorias</a>
              <a href="#about" className="block py-2 text-gray-700">Sobre</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seus <span className="text-green-500">pontos</span> em <span className="text-gray-600">recompensas</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Descubra milhares de produtos incríveis e resgate com seus pontos oi
          </p>
          <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            Explorar Produtos
          </Button>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Produtos em Destaque
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.availability === 'unavailable' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Indisponível</span>
                    </div>
                  )}
                  {product.availability === 'limited' && (
                    <Badge variant="outline" className="absolute top-2 right-2">
                      Limitado
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                          ? 'text-green-400 fill-current'
                          : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{product.rating}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                      {product.points.toLocaleString()} pts
                    </div>
                      <div className="text-sm text-gray-500">
                        {product.reviews} avaliações
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate(`/loja-oi/produto/${product.id}`)}
                    disabled={product.availability === 'unavailable' || user.points < product.points}
                    className="w-full"
                    variant={user.points >= product.points && product.availability !== 'unavailable' ? "default" : "secondary"}
                  >
                    {product.availability === 'unavailable'
                      ? 'Indisponível'
                      : user.points < product.points
                      ? 'Pontos Insuficientes'
                      : 'Resgatar Agora'
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <img 
                      src="/oi-logo.svg" 
                      alt="oi logo" 
                      className="w-10 h-10"
                    />
                </div>
                <span className="text-xl font-bold">Oi Tv</span>
              </div>
              <p className="text-gray-400">
                Transformando pontos em experiências incríveis desde 2024.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Eletrônicos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casa & Decoração</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Moda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Viagens</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contato@oi.com.br</li>
                <li>(11) 9999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 oi TV Clube de Pontos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PointsStore;