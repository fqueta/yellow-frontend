import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save, Palette } from "lucide-react";
import { systemSettingsService, AdvancedSystemSettings } from "@/services/systemSettingsService";

/**
 * Página de configurações do sistema
 * Contém duas abas: Configurações Básicas e Configurações Avançadas
 * Cada aba possui cards com diferentes tipos de configurações
 */
export default function SystemSettings() {
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState("basic");
  
  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(false);

  // Estados para configurações básicas - Switch
  const [basicSwitchSettings, setBasicSwitchSettings] = useState(() => {
    const saved = localStorage.getItem('basicSwitchSettings');
    return saved ? JSON.parse(saved) : {
      enableNotifications: true,
      enableAutoBackup: false,
      enableMaintenanceMode: false,
      enableDebugMode: false,
    };
  });

  // Nota: As configurações de aparência agora são aplicadas globalmente pelo ThemeProvider

  // Estados para configurações básicas - Select
  const [basicSelectSettings, setBasicSelectSettings] = useState(() => {
    const saved = localStorage.getItem('basicSelectSettings');
    return saved ? JSON.parse(saved) : {
      defaultLanguage: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL",
    };
  });

  // Estados para configurações de aparência
  const [appearanceSettings, setAppearanceSettings] = useState(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      primaryColor: "#0b217b",
      secondaryColor: "#4b89cd",
      fontSize: "medium",
      theme: "default",
      compactMode: true,
      showAnimations: true,
    };
  });

  // Estados para configurações avançadas - Switch
  const [advancedSwitchSettings, setAdvancedSwitchSettings] = useState({
    enableApiLogging: true,
    enableCaching: true,
    enableCompression: false,
    enableSslRedirect: true,
  });

  // Estados para configurações avançadas - Select
  const [advancedSelectSettings, setAdvancedSelectSettings] = useState({
    logLevel: "info",
    cacheDriver: "redis",
    sessionDriver: "database",
    queueDriver: "sync",
  });

  // Estados para configurações avançadas - Input
  const [advancedInputSettings, setAdvancedInputSettings] = useState({
    maxFileSize: "",
    sessionTimeout: "",
    apiRateLimit: "",
    maxConnections: "",
    backupRetention: "",
    url_api_aeroclube: "",
    token_api_aeroclube: "",
  });

  /**
   * Manipula mudanças nos switches das configurações básicas
   */
  const handleBasicSwitchChange = (key: string, value: boolean) => {
    const newSettings = { ...basicSwitchSettings, [key]: value };
    setBasicSwitchSettings(newSettings);
    localStorage.setItem('basicSwitchSettings', JSON.stringify(newSettings));
    
    // Aplicar configurações do sistema em tempo real
    applySystemSettings(newSettings);
  };

  /**
   * Manipula mudanças nos selects das configurações básicas
   */
  const handleBasicSelectChange = (key: string, value: string) => {
    const newSettings = { ...basicSelectSettings, [key]: value };
    setBasicSelectSettings(newSettings);
    localStorage.setItem('basicSelectSettings', JSON.stringify(newSettings));
  };

  /**
   * Manipula mudanças nas configurações de aparência
   */
  const handleAppearanceChange = (key: string, value: string | boolean) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    localStorage.setItem('appearanceSettings', JSON.stringify(newSettings));
    
    // Aplicar configurações de aparência em tempo real
    applyAppearanceSettings(newSettings);
  };

  /**
   * Aplica configurações do sistema em tempo real
   */
  const applySystemSettings = (settings: typeof basicSwitchSettings) => {
    // Aplicar notificações
    if (settings.enableNotifications) {
      // Habilitar notificações do sistema
      console.log('Notificações habilitadas');
    } else {
      console.log('Notificações desabilitadas');
    }
    
    // Aplicar modo de manutenção
    if (settings.enableMaintenanceMode) {
      document.body.classList.add('maintenance-mode');
      toast.info('Modo de manutenção ativado');
    } else {
      document.body.classList.remove('maintenance-mode');
    }
    
    // Aplicar modo debug
    if (settings.enableDebugMode) {
      console.log('Modo debug ativado - logs detalhados habilitados');
      window.localStorage.setItem('debug', 'true');
    } else {
      window.localStorage.removeItem('debug');
    }
  };

  /**
   * Aplica configurações de aparência em tempo real
   */
  const applyAppearanceSettings = (settings: typeof appearanceSettings) => {
    const root = document.documentElement;
    
    // Aplicar modo escuro
    if (settings.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Aplicar cores personalizadas
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    
    // Aplicar tamanho da fonte
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizes[settings.fontSize as keyof typeof fontSizes]);
    
    // Aplicar modo compacto
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    // Aplicar animações
    if (!settings.showAnimations) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  };

  /**
   * Salva configurações de aparência
   */
  const handleSaveAppearanceSettings = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    applyAppearanceSettings(appearanceSettings);
    toast.success('Configurações de aparência salvas!');
  };

  /**
   * Salva configurações gerais
   */
  const handleSaveGeneralSettings = () => {
    localStorage.setItem('basicSwitchSettings', JSON.stringify(basicSwitchSettings));
    applySystemSettings(basicSwitchSettings);
    toast.success('Configurações gerais salvas!');
  };

  /**
   * Salva preferências do sistema
   */
  const handleSaveSystemPreferences = () => {
    localStorage.setItem('basicSelectSettings', JSON.stringify(basicSelectSettings));
    toast.success('Preferências do sistema salvas!');
  };

  /**
   * Manipula mudanças nos switches das configurações avançadas
   */
  const handleAdvancedSwitchChange = (key: string, value: boolean) => {
    setAdvancedSwitchSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Manipula mudanças nos selects das configurações avançadas
   */
  const handleAdvancedSelectChange = (key: string, value: string) => {
    setAdvancedSelectSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Manipula mudanças nos inputs das configurações avançadas
   */
  const handleAdvancedInputChange = (key: string, value: string) => {
    setAdvancedInputSettings(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Salva todas as configurações
   */
  const handleSaveSettings = async () => {
    try {
      // Prepara as configurações avançadas para envio à API
      const advancedSettings: AdvancedSystemSettings = {
        // Configurações com Switch
        enableApiLogging: advancedSwitchSettings.enableApiLogging,
        enableCaching: advancedSwitchSettings.enableCaching,
        enableCompression: advancedSwitchSettings.enableCompression,
        enableSslRedirect: advancedSwitchSettings.enableSslRedirect,
        
        // Configurações com Select
        logLevel: advancedSelectSettings.logLevel,
        cacheDriver: advancedSelectSettings.cacheDriver,
        sessionDriver: advancedSelectSettings.sessionDriver,
        queueDriver: advancedSelectSettings.queueDriver,
        
        // Configurações com Input
        maxFileSize: advancedInputSettings.maxFileSize,
        sessionTimeout: advancedInputSettings.sessionTimeout,
        apiRateLimit: advancedInputSettings.apiRateLimit,
        maxConnections: advancedInputSettings.maxConnections,
        backupRetention: advancedInputSettings.backupRetention,
        url_api_aeroclube: advancedInputSettings.url_api_aeroclube,
        token_api_aeroclube: advancedInputSettings.token_api_aeroclube,
      };

      // Envia as configurações avançadas para a API na rota /options
      await systemSettingsService.saveAdvancedSettings(advancedSettings);
      
      // Log das outras configurações (não enviadas para API ainda)
      console.log('Configurações Básicas - Switch:', basicSwitchSettings);
      console.log('Configurações Básicas - Select:', basicSelectSettings);
      console.log('Configurações de Aparência:', appearanceSettings);
      console.log('Configurações Avançadas enviadas para API:', advancedSettings);
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações. Tente novamente.");
    }
  };

  /**
   * Carrega as configurações avançadas da API
   */
  const loadAdvancedSettings = async () => {
    try {
      setIsLoading(true);
      const data = await systemSettingsService.getAdvancedSettings('/options');
      console.log('data',data);
      
      // Atualiza o estado com os dados da API
      setAdvancedInputSettings({
        maxFileSize: data.maxFileSize || "",
        sessionTimeout: data.sessionTimeout || "",
        apiRateLimit: data.apiRateLimit || "",
        maxConnections: data.maxConnections || "",
        backupRetention: data.backupRetention || "",
        url_api_aeroclube: data.url_api_aeroclube || "",
        token_api_aeroclube: data.token_api_aeroclube || "",
      });
      
      // Também atualiza as outras configurações se necessário
      if (data.enableApiLogging !== undefined) {
        setAdvancedSwitchSettings(prev => ({
          ...prev,
          enableApiLogging: data.enableApiLogging,
          enableCaching: data.enableCaching,
          enableCompression: data.enableCompression,
          enableSslRedirect: data.enableSslRedirect,
        }));
      }
      
      if (data.logLevel) {
        setAdvancedSelectSettings(prev => ({
          ...prev,
          logLevel: data.logLevel,
          cacheDriver: data.cacheDriver,
          sessionDriver: data.sessionDriver,
          queueDriver: data.queueDriver,
        }));
      }
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações da API');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * useEffect para carregar as configurações ao montar o componente
   */
  useEffect(() => {
    loadAdvancedSettings();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        </div>
        {/* Botão visível apenas na aba avançada */}
        {activeTab === "advanced" && (
          <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </Button>
        )}
      </div>

      {/* Abas de Configurações */}
      <Tabs defaultValue="basic" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
          <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
        </TabsList>

        {/* Aba de Configurações Básicas */}
        <TabsContent value="basic" className="space-y-6">
          {/* Card de Configurações de Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Configurações de Aparência</span>
              </CardTitle>
              <CardDescription>
                Personalize a aparência e o tema da interface do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Switches de Aparência */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar tema escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={appearanceSettings.darkMode}
                    onCheckedChange={(value) => handleAppearanceChange('darkMode', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactMode">Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduzir espaçamentos para mostrar mais conteúdo
                    </p>
                  </div>
                  <Switch
                    id="compactMode"
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(value) => handleAppearanceChange('compactMode', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showAnimations">Animações</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar animações e transições na interface
                    </p>
                  </div>
                  <Switch
                    id="showAnimations"
                    checked={appearanceSettings.showAnimations}
                    onCheckedChange={(value) => handleAppearanceChange('showAnimations', value)}
                  />
                </div>
              </div>

              {/* Configurações de Cores e Tema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => handleAppearanceChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => handleAppearanceChange('secondaryColor', e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Selects de Aparência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) => handleAppearanceChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="modern">Moderno</SelectItem>
                      <SelectItem value="classic">Clássico</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                  <Select
                    value={appearanceSettings.fontSize}
                    onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequena</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="extra-large">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Botão de salvamento do card de aparência */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveAppearanceSettings} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Salvar Aparência</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Card 1 - Configurações com Switch */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções básicas do sistema usando os interruptores abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">Habilitar Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre eventos importantes do sistema
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={basicSwitchSettings.enableNotifications}
                  onCheckedChange={(value) => handleBasicSwitchChange('enableNotifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAutoBackup">Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Realizar backup automático dos dados diariamente
                  </p>
                </div>
                <Switch
                  id="enableAutoBackup"
                  checked={basicSwitchSettings.enableAutoBackup}
                  onCheckedChange={(value) => handleBasicSwitchChange('enableAutoBackup', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableMaintenanceMode">Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar modo de manutenção para usuários externos
                  </p>
                </div>
                <Switch
                  id="enableMaintenanceMode"
                  checked={basicSwitchSettings.enableMaintenanceMode}
                  onCheckedChange={(value) => handleBasicSwitchChange('enableMaintenanceMode', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableDebugMode">Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar logs detalhados para depuração
                  </p>
                </div>
                <Switch
                  id="enableDebugMode"
                  checked={basicSwitchSettings.enableDebugMode}
                  onCheckedChange={(value) => handleBasicSwitchChange('enableDebugMode', value)}
                />
              </div>
              
              {/* Botão de salvamento do card geral */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveGeneralSettings} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Salvar Configurações Gerais</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Configurações com Select */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Configure as preferências padrão do sistema usando os seletores abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
                <Select
                  value={basicSelectSettings.defaultLanguage}
                  onValueChange={(value) => handleBasicSelectChange('defaultLanguage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={basicSelectSettings.timezone}
                  onValueChange={(value) => handleBasicSelectChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Formato de Data</Label>
                <Select
                  value={basicSelectSettings.dateFormat}
                  onValueChange={(value) => handleBasicSelectChange('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda Padrão</Label>
                <Select
                  value={basicSelectSettings.currency}
                  onValueChange={(value) => handleBasicSelectChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botão de salvamento das preferências */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveSystemPreferences} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Salvar Preferências</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Configurações Avançadas */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Card 1 - Configurações com Switch */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sistema</CardTitle>
              <CardDescription>
                Configure opções avançadas do sistema que afetam performance e segurança.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableApiLogging">Log de API</Label>
                  <p className="text-sm text-muted-foreground">
                    Registrar todas as chamadas de API para auditoria
                  </p>
                </div>
                <Switch
                  id="enableApiLogging"
                  checked={advancedSwitchSettings.enableApiLogging}
                  onCheckedChange={(value) => handleAdvancedSwitchChange('enableApiLogging', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableCaching">Cache do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar cache para melhorar performance
                  </p>
                </div>
                <Switch
                  id="enableCaching"
                  checked={advancedSwitchSettings.enableCaching}
                  onCheckedChange={(value) => handleAdvancedSwitchChange('enableCaching', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableCompression">Compressão GZIP</Label>
                  <p className="text-sm text-muted-foreground">
                    Comprimir respostas HTTP para reduzir largura de banda
                  </p>
                </div>
                <Switch
                  id="enableCompression"
                  checked={advancedSwitchSettings.enableCompression}
                  onCheckedChange={(value) => handleAdvancedSwitchChange('enableCompression', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableSslRedirect">Redirecionamento SSL</Label>
                  <p className="text-sm text-muted-foreground">
                    Forçar redirecionamento para HTTPS
                  </p>
                </div>
                <Switch
                  id="enableSslRedirect"
                  checked={advancedSwitchSettings.enableSslRedirect}
                  onCheckedChange={(value) => handleAdvancedSwitchChange('enableSslRedirect', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Configurações com Select */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Infraestrutura</CardTitle>
              <CardDescription>
                Configure drivers e níveis de sistema para otimizar o funcionamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">Nível de Log</Label>
                <Select
                  value={advancedSelectSettings.logLevel}
                  onValueChange={(value) => handleAdvancedSelectChange('logLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheDriver">Driver de Cache</Label>
                <Select
                  value={advancedSelectSettings.cacheDriver}
                  onValueChange={(value) => handleAdvancedSelectChange('cacheDriver', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="memcached">Memcached</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDriver">Driver de Sessão</Label>
                <Select
                  value={advancedSelectSettings.sessionDriver}
                  onValueChange={(value) => handleAdvancedSelectChange('sessionDriver', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="cookie">Cookie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="queueDriver">Driver de Fila</Label>
                <Select
                  value={advancedSelectSettings.queueDriver}
                  onValueChange={(value) => handleAdvancedSelectChange('queueDriver', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sync">Sync</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="sqs">Amazon SQS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 - Configurações com Input */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Numéricas</CardTitle>
              <CardDescription>
                Configure limites e valores numéricos do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={advancedInputSettings.maxFileSize}
                  onChange={(e) => handleAdvancedInputChange('maxFileSize', e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={advancedInputSettings.sessionTimeout}
                  onChange={(e) => handleAdvancedInputChange('sessionTimeout', e.target.value)}
                  placeholder="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">Limite de Taxa da API (req/min)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={advancedInputSettings.apiRateLimit}
                  onChange={(e) => handleAdvancedInputChange('apiRateLimit', e.target.value)}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConnections">Máximo de Conexões Simultâneas</Label>
                <Input
                  id="maxConnections"
                  type="number"
                  value={advancedInputSettings.maxConnections}
                  onChange={(e) => handleAdvancedInputChange('maxConnections', e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">Retenção de Backup (dias)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  value={advancedInputSettings.backupRetention}
                  onChange={(e) => handleAdvancedInputChange('backupRetention', e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url_api_aeroclube">URL da api das propostas</Label>
                <Input
                  id="url_api_aeroclube"
                  type="text"
                  value={advancedInputSettings.url_api_aeroclube}
                  onChange={(e) => handleAdvancedInputChange('url_api_aeroclube', e.target.value)}
                  placeholder="http://localhost:3000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_api_aeroclube">Token de acesso da API</Label>
                <Input
                  id="token_api_aeroclube"
                  type="text"
                  value={advancedInputSettings.token_api_aeroclube}
                  onChange={(e) => handleAdvancedInputChange('token_api_aeroclube', e.target.value)}
                  placeholder="token da api"
                />
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}