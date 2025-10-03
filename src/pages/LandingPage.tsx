import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Landing page component for Yellow Benefits Club
 * Features modern design with Yellow brand colors (yellow and purple)
 */
const LandingPage = () => {
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
            <Button variant="outline" asChild className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-purple-700 hover:bg-purple-800">
              <Link to="/register">Cadastrar</Link>
            </Button>
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
              <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white" asChild>
                <Link to="/register">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-yellow-400 text-purple-700 hover:bg-yellow-50" asChild>
                <Link to="/loja-oi">
                  Explorar Loja
                  <Gift className="ml-2 h-5 w-5" />
                </Link>
              </Button>
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
              <Button className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-purple-800" asChild>
                <Link to="/register">Quero fazer parte!</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-3xl flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-purple-700">Y</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Yellow</h3>
                  <p className="text-lg opacity-90">Benefits Company</p>
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
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-purple-800" asChild>
              <Link to="/register">
                Cadastrar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-800" asChild>
              <Link to="/loja-oi">Explorar Produtos</Link>
            </Button>
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
                <li><Link to="/loja-oi" className="hover:text-yellow-400">Loja de Pontos</Link></li>
                <li><Link to="/register" className="hover:text-yellow-400">Cadastro</Link></li>
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