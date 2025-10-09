import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserPrefsProvider } from "./contexts/UserPrefsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRedirect } from "./components/auth/AuthRedirect";
import { AppLayout } from "./components/layout/AppLayout";
// import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientView from "./pages/ClientView";
import ClientCreate from "./pages/ClientCreate";
import ClientEdit from "./pages/ClientEdit";
import Partners from "./pages/Partners";
import PartnerView from "./pages/PartnerView";
import ServiceObjects from "./pages/ServiceObjects";
import Aircraft from "./pages/Aircraft";
import AircraftView from "./pages/AircraftView";
import Products from "./pages/Products";
import ProductView from "./pages/ProductView";
import ProductCreate from "./pages/ProductCreate";
import ProductEdit from "./pages/ProductEdit";
import Services from "./pages/Services";
import ServiceView from "./pages/ServiceView";
import Categories from "./pages/Categories";
import Permissions from "./pages/settings/Permissions";
import Users from "./pages/settings/Users";
import UserProfiles from "./pages/settings/UserProfiles";
import SystemSettings from "./pages/settings/SystemSettings";
import Login from "./pages/auth/Login";
import Metrics from "./pages/settings/Metrics";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";
import { PermissionGuard } from "./components/auth/PermissionGuard";
import Dashboard from "@/pages/Dashboard";
import MetricsDashboard from "@/pages/MetricsDashboard";
import ServiceOrders from "./pages/ServiceOrders";
import CreateServiceOrder from "./pages/CreateServiceOrder";
import UpdateServiceOrder from "./pages/UpdateServiceOrder";
import ShowServiceOrder from "./pages/ShowServiceOrder";
import QuickCreateServiceOrder from "./pages/QuickCreateServiceOrder";
import Financial from "./pages/financial/Financial";
import FinancialCategories from "./pages/FinancialCategories";
import PublicClientForm from "@/pages/PublicClientForm";
import PointsStore from "@/pages/loja/PointsStore";
import ProductDetails from "./pages/loja/ProductDetails";
import MyRedemptions from "./pages/loja/MyRedemptions";
import RedemptionDetails from "./pages/loja/RedemptionDetails";
import ClientArea from "./pages/loja/ClientArea";
import LandingPage from "./pages/LandingPage";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminPointsExtracts from "./pages/AdminPointsExtracts";
import AdminRedemptionDetails from "./pages/AdminRedemptionDetails";
import AdminPointsExtractDetails from "./pages/AdminPointsExtractDetails";

// console.log('App.tsx: Starting app initialization');
// console.log('QueryClient available:', QueryClient);
// console.log('QueryClientProvider available:', QueryClientProvider);

// Configuração do QueryClient com opções de segurança para prevenir loops infinitos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Previne loops infinitos limitando tentativas de retry
      retry: (failureCount, error: any) => {
        // Não tenta novamente para erros 4xx (cliente) ou se já tentou 2 vezes
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      // Tempo que os dados ficam "frescos" antes de serem considerados obsoletos
      staleTime: 5 * 60 * 1000, // 5 minutos
      // Tempo que os dados ficam em cache antes de serem removidos
      gcTime: 30 * 60 * 1000, // 30 minutos (anteriormente cacheTime)
      // Desabilita refetch automático quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Desabilita refetch automático quando reconecta à internet
      refetchOnReconnect: false,
      // Intervalo de refetch automático (desabilitado)
      refetchInterval: false,
      // Configurações específicas para prevenir loops em listas vazias
      refetchOnMount: true,
    },
    mutations: {
      // Configurações para mutações (create, update, delete)
      retry: 1,
    },
  },
});
// console.log('QueryClient instance created with security configurations:', queryClient);

const App = () => {
  // console.log('App component rendering');
  const link_loja = "/lojaderesgatesantenamais";
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserPrefsProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Navigate to={link_loja} replace />} />
              <Route path="/login" element={
                <AuthRedirect>
                  <Login />
                </AuthRedirect>
              } />
              <Route path="/register" element={
                <AuthRedirect>
                  <Register />
                </AuthRedirect>
              } />
              <Route path="/forgot-password" element={
                <AuthRedirect>
                  <ForgotPassword />
                </AuthRedirect>
              } />
              <Route path="/reset-password" element={
                <AuthRedirect>
                  <ResetPassword />
                </AuthRedirect>
              } />
              <Route path="/form-client-active/:cpf" element={<PublicClientForm />} />
              
              {/* Rotas da loja - protegidas */}
              <Route path={link_loja} element={
                <ProtectedRoute>
                  <PointsStore linkLoja={link_loja} />
                </ProtectedRoute>
              } />
              <Route path={link_loja + "/produto/:productId"} element={
                <ProtectedRoute>
                  <ProductDetails linkLoja={link_loja} />
                </ProtectedRoute>
              } />
              <Route path={link_loja + "/meus-resgates"} element={
                <ProtectedRoute>
                  <MyRedemptions linkLoja={link_loja} />
                </ProtectedRoute>
              } />
              <Route path={link_loja + "/resgate/:id"} element={
                <ProtectedRoute>
                  <RedemptionDetails linkLoja={link_loja} />
                </ProtectedRoute>
              } />
              <Route path={link_loja + "/area-cliente"} element={ 
                <ProtectedRoute>
                  <ClientArea linkLoja={link_loja} />
                </ProtectedRoute>
              } />
              <Route path={link_loja + "/configuracoes"} element={ 
                <ProtectedRoute>
                  <Navigate to={`${link_loja}/area-cliente?tab=settings`} replace />
                </ProtectedRoute>
              } />
              
              {/* Rotas protegidas */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AppLayout>
                    {/* <Dashboard2 /> */}
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              {/* <Route path="/painel2" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard2 />
                  </AppLayout>
                </ProtectedRoute>
              } /> */}
              <Route path="/admin/clients" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Clients />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/clients/create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/clients/:id/view" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/clients/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientEdit />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/partners" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Partners />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/partners/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PartnerView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/partners/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Partners />
                  </AppLayout>
                </ProtectedRoute>
              } />              
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Products />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products/create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProductCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProductEdit />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/products/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProductView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Services />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/services/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Categories />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings/permissions" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="settings.permissions.view" 
                      menuPath="/admin/settings/permissions"
                      requireRemote={false}
                    >
                      <Permissions />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings/users" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      menuPath="/admin/settings/users"
                      requireRemote={false}
                    >
                      <Users />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings/metrics" element={
              <ProtectedRoute>
                <AppLayout>
                  <PermissionGuard required="settings.metrics.view">
                    <Metrics />
                  </PermissionGuard>
                </AppLayout>
              </ProtectedRoute>
            } />
              <Route path="/admin/metrics-dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard required="settings.metrics.view">
                      <MetricsDashboard />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings/user-profiles" element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserProfiles />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings/system" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="settings.system.view" 
                      menuPath="/admin/settings/system"
                      requireRemote={false}
                    >
                      <SystemSettings />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas do Módulo Financeiro */}
              <Route path="/admin/financial" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="financial.view" 
                      menuPath="/admin/financial"
                      requireRemote={false}
                    >
                      <Financial />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/financial/categories" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="financial.categories.view" 
                      menuPath="/admin/financial/categories"
                      requireRemote={false}
                    >
                      <FinancialCategories />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas de Administração de Pontos */}
              <Route path="/admin/redemptions" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="points.redemptions.view" 
                      menuPath="/admin/redemptions"
                      requireRemote={false}
                    >
                      <AdminRedemptions />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/points-extracts" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="points.extracts.view" 
                      menuPath="/admin/points-extracts"
                      requireRemote={false}
                    >
                      <AdminPointsExtracts />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas de Detalhes de Pontos */}
              <Route path="/admin/redemptions/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="points.redemptions.view" 
                      menuPath="/admin/redemptions"
                      requireRemote={false}
                    >
                      <AdminRedemptionDetails />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/points-extracts/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="points.extracts.view" 
                      menuPath="/admin/points-extracts"
                      requireRemote={false}
                    >
                      <AdminPointsExtractDetails />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas de Ordens de Serviço */}
              <Route path="/admin/service-orders" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrders />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/service-orders/quick-create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuickCreateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/service-orders/create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/service-orders/update/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <UpdateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/service-orders/show/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ShowServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
            </TooltipProvider>
          </UserPrefsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
