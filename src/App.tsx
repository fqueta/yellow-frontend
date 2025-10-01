import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserPrefsProvider } from "./contexts/UserPrefsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
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
console.log('QueryClient instance created with security configurations:', queryClient);

const App = () => {
  console.log('App component rendering');
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/form-client-active/:cpf" element={<PublicClientForm />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={
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
              <Route path="/clients" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Clients />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients/create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients/:id/view" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientEdit />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/partners" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Partners />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/partners/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PartnerView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/partners/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Partners />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-objects" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceObjects />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/aircraft" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Aircraft />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/aircraft/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AircraftView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Products />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/products/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProductView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Services />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/services/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Categories />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/permissions" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="settings.permissions.view" 
                      menuPath="/settings/permissions"
                      requireRemote={false}
                    >
                      <Permissions />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/users" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      menuPath="/settings/users"
                      requireRemote={false}
                    >
                      <Users />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/metrics" element={
              <ProtectedRoute>
                <AppLayout>
                  <PermissionGuard required="settings.metrics.view">
                    <Metrics />
                  </PermissionGuard>
                </AppLayout>
              </ProtectedRoute>
            } />
              <Route path="/metrics-dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard required="settings.metrics.view">
                      <MetricsDashboard />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/user-profiles" element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserProfiles />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/system" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="settings.system.view" 
                      menuPath="/settings/system"
                      requireRemote={false}
                    >
                      <SystemSettings />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas do Módulo Financeiro */}
              <Route path="/financial" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="financial.view" 
                      menuPath="/financial"
                      requireRemote={false}
                    >
                      <Financial />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/financial/categories" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="financial.categories.view" 
                      menuPath="/financial/categories"
                      requireRemote={false}
                    >
                      <FinancialCategories />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Rotas de Ordens de Serviço */}
              <Route path="/service-orders" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceOrders />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-orders/quick-create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuickCreateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-orders/create" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-orders/update/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <UpdateServiceOrder />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-orders/show/:id" element={
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
