import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gift, Star, Users, Zap, ArrowRight, CheckCircle, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { LoginRedirectLink } from "@/components/auth/LoginRedirectLink";
import { useAuth } from "@/contexts/AuthContext";
import { PointsStoreProps } from "@/types/products";
/**
 * Landing page component for Yellow Benefits Club
 * Features modern design with Yellow brand colors (yellow and purple)
 */
const LandingPage = ({ linkLoja }: PointsStoreProps) => {
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  // fazer requisição na api para solicitar um smartlink do clube de pontos rota GET /smartlink
  const hadleStartAlloyal = async () => {
    try {
      const response = await fetch('/api/smartlink', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
      });
      const data = await response.json();
      if (data.smartlink) {
        window.location.href = data.smartlink;
      }
    } catch (error) {
      console.error('Erro ao solicitar smartlink:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-purple-700 font-bold text-xl">Y</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-700">Yellow</h1>
              <p className="text-sm text-purple-600">Benefits Company</p>
            </div>
          </div>
          <div className="flex space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={linkLoja} className="flex items-center">
                      <Gift className="mr-2 h-4 w-4" />
                      Loja de Pontos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={linkLoja + '/area-cliente'} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Área do Cliente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={linkLoja + '/meus-resgates'} className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Meus Resgates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="bg-purple-700 hover:bg-purple-800">
                  <Link to="/public-client-form">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-yellow-400 text-purple-700 hover:bg-yellow-500 mb-4">
              🎉 Clube de Vantagens Exclusivo
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-purple-800 mb-6">
              Bem-vindo ao
              <span className="text-yellow-500 block">Yellow Club</span>
            </h1>
            <p className="text-xl text-purple-600 mb-8 max-w-2xl mx-auto">
              Descubra um mundo de vantagens exclusivas, recompensas incríveis e benefícios únicos. 
              Junte-se à nossa comunidade e transforme cada compra em uma oportunidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white" asChild>
                  <Link to="/public-client-form">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={hadleStartAlloyal} className="bg-purple-700 hover:bg-purple-800 text-white">
                  Clube de Vantagens
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {isAuthenticated && (
                <Button size="lg" variant="outline" className="border-yellow-400 text-purple-700 hover:bg-yellow-50" asChild>
                  <LoginRedirectLink to={linkLoja} requireAuth={true}>
                    Explorar Loja 
                    <Gift className="ml-2 h-5 w-5" />
                  </LoginRedirectLink>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-purple-800 mb-4">Por que escolher o Yellow Club?</h2>
            <p className="text-xl text-purple-600 max-w-2xl mx-auto">
              Oferecemos uma experiência única de benefícios e recompensas pensada especialmente para você.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-700" />
                </div>
                <CardTitle className="text-purple-800">Recompensas Exclusivas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-purple-600">
                  Acumule pontos a cada compra e troque por produtos incríveis, descontos especiais e experiências únicas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-700" />
                </div>
                <CardTitle className="text-purple-800">Comunidade VIP</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-purple-600">
                  Faça parte de uma comunidade exclusiva com acesso antecipado a lançamentos e eventos especiais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-700" />
                </div>
                <CardTitle className="text-purple-800">Benefícios Instantâneos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-purple-600">
                  Aproveite descontos imediatos, frete grátis e condições especiais desde o primeiro dia como membro.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-purple-800 mb-6">Vantagens que fazem a diferença</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-purple-700">Cashback em todas as compras</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-purple-700">Descontos exclusivos em parceiros</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-purple-700">Acesso antecipado a promoções</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-purple-700">Suporte prioritário 24/7</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-purple-700">Programa de indicação com bônus</span>
                </div>
              </div>
              {!isAuthenticated && (
                <Button className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-purple-800" asChild>
                  <Link to="/public-client-form">Quero fazer parte!</Link>
                </Button>
              )}
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-3xl flex items-center justify-center relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full object-cover" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Shopping bags */}
                    <path d="M80 120h40v20h-40z" fill="white" opacity="0.3"/>
                    <path d="M85 100c0-8 6-15 15-15s15 7 15 15" stroke="white" strokeWidth="3" fill="none" opacity="0.4"/>
                    
                    {/* Gift box */}
                    <rect x="280" y="80" width="60" height="60" fill="white" opacity="0.3" rx="5"/>
                    <path d="M280 110h60M310 80v60" stroke="white" strokeWidth="4" opacity="0.4"/>
                    <circle cx="310" cy="70" r="8" fill="white" opacity="0.4"/>
                    
                    {/* Credit card */}
                    <rect x="150" y="280" width="80" height="50" fill="white" opacity="0.3" rx="8"/>
                    <rect x="160" y="295" width="60" height="4" fill="white" opacity="0.5"/>
                    <rect x="160" y="305" width="30" height="3" fill="white" opacity="0.4"/>
                    
                    {/* Coins */}
                    <circle cx="320" cy="280" r="15" fill="white" opacity="0.3"/>
                    <circle cx="340" cy="270" r="12" fill="white" opacity="0.25"/>
                    <circle cx="305" cy="300" r="10" fill="white" opacity="0.2"/>
                    
                    {/* Stars */}
                    <path d="M60 200l4 8 8 0-6 6 2 8-8-4-8 4 2-8-6-6 8 0z" fill="white" opacity="0.3"/>
                    <path d="M350 180l3 6 6 0-5 4 1 6-5-3-5 3 1-6-5-4 6 0z" fill="white" opacity="0.25"/>
                    <path d="M120 320l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="white" opacity="0.2"/>
                    
                    {/* Percentage symbols */}
                    <text x="50" y="300" fontSize="24" fill="white" opacity="0.3" fontWeight="bold">%</text>
                    <text x="360" y="120" fontSize="20" fill="white" opacity="0.25" fontWeight="bold">%</text>
                    
                    {/* Trophy */}
                    <path d="M200 50h20v30h-20z" fill="white" opacity="0.3"/>
                    <path d="M195 80h30v10h-30z" fill="white" opacity="0.4"/>
                    <circle cx="210" cy="45" r="8" fill="white" opacity="0.3"/>
                  </svg>
                </div>
                
                {/* Content overlay */}
                <div className="text-center text-white relative z-10">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl font-bold text-purple-700">Y</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Yellow</h3>
                  <p className="text-lg opacity-90 drop-shadow-md">Benefits Company</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-700 to-purple-800">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para começar sua jornada?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de membros que já descobriram as vantagens do Yellow Club. 
            Cadastre-se agora e comece a aproveitar todos os benefícios!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-purple-800" asChild>
                <Link to="/public-client-form">
                  Cadastrar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            {/* <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-800" asChild>
              <LoginRedirectLink to="/loja" requireAuth={true}>Explorar Produtos</LoginRedirectLink>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold">Y</span>
                </div>
                <div>
                  <h3 className="font-bold">Yellow</h3>
                  <p className="text-sm text-purple-300">Benefits Company</p>
                </div>
              </div>
              <p className="text-purple-300 text-sm">
                Transformando cada compra em uma oportunidade de economia e recompensa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><LoginRedirectLink to={linkLoja} requireAuth={true} className="hover:text-yellow-400">Loja de Pontos</LoginRedirectLink></li>
                <li><Link to="/public-client-form" className="hover:text-yellow-400">Cadastro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><a href="#" className="hover:text-yellow-400">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-purple-300">
                <li><a href="#" className="hover:text-yellow-400">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-yellow-400">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800 mt-8 pt-8 text-center text-sm text-purple-300">
            <p>&copy; 2024 Yellow Benefits Company. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;