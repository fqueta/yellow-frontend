import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Gift, User, Search, Menu, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useProductsList } from '@/hooks/products';
import { useCategoriesList } from '@/hooks/categories';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/products';
import { Category } from '@/types/categories';



// Interface para dados do usuário na loja (estendendo o User do auth)
interface StoreUser {
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

  // Obter dados do usuário autenticado
  const { user: authUser } = useAuth();
  
  // Mapear dados do usuário autenticado para a interface da loja
  // console.log('authUser:', authUser);
  
  const user: StoreUser = {
    name: authUser?.name || 'Usuário',
    points: authUser?.points ? Number(authUser?.points) : 0, // TODO: Implementar pontos do usuário quando disponível na API
    avatar: authUser?.foto_perfil || authUser?.avatar || '' // Usar ícone User quando não há avatar
  };

  // Buscar produtos da API com limite de 100
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProductsList({
    limit: 100,
    // entidade: 'produtos'
  });
  const products = productsData?.data || [];

  // Buscar categorias da API com limite de 5
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategoriesList({ 
    limit: 5,
    // entidade: 'produtos'
  });
  
  // Mapear categorias da API e adicionar categoria "Todos"
  const apiCategories = categoriesData?.data || [];
  const categories = [
    { id: 'all', name: 'Todos', icon: '🛍️' },
    ...apiCategories.map((category: Category) => ({
      id: category.id,
      name: category.name,
      icon: '📦' // Ícone padrão para categorias da API
    }))
  ];

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const categoryId = product.category?.id || product.categoryId || '';
    const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Função para resgatar produto
  const handleRedeem = (product: Product) => {
    if (!product.isActive) {
      toast({
        title: "Produto indisponível",
        description: "Este produto está temporariamente fora de estoque.",
        variant: "destructive"
      });
      return;
    }

    const pointsRequired = product.pointsRequired || 0;
    if (user.points < pointsRequired) {
      toast({
        title: "Pontos insuficientes",
        description: `Você precisa de ${pointsRequired - user.points} pontos a mais para resgatar este produto.`,
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
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
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
              {categoriesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-600">Carregando categorias...</span>
                </div>
              ) : categoriesError ? (
                <div className="text-sm text-red-500">Erro ao carregar categorias</div>
              ) : (
                categories.map((category) => (
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
                ))
              )}
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
          
          {/* Loading State */}
          {productsLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Carregando produtos...</span>
            </div>
          )}
          
          {/* Error State */}
          {productsError && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Erro ao carregar produtos. Tente novamente mais tarde.</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!productsLoading && !productsError && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const pointsRequired = product.pointsRequired || 0;
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {!product.isActive && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-semibold">Indisponível</span>
                          </div>
                        )}
                        {product.isActive && pointsRequired > 10000 && (
                          <Badge variant="outline" className="absolute top-2 right-2">
                            Premium
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
                                i < 4 // Rating fixo de 4 estrelas
                                ? 'text-green-400 fill-current'
                                : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">4.0</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {pointsRequired.toLocaleString()} pts
                            </div>
                            <div className="text-sm text-gray-500">
                              0 avaliações
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => navigate(`/loja/produto/${product.slug || product.id}`)}
                          disabled={!product.isActive || user.points < pointsRequired}
                          className="w-full"
                          variant={user.points >= pointsRequired && product.isActive ? "default" : "secondary"}
                        >
                          {!product.isActive
                            ? 'Indisponível'
                            : user.points < pointsRequired
                            ? 'Pontos Insuficientes'
                            : 'Resgatar Agora'
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
                </div>
              )}
            </>
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