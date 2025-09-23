import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { mascaraCpf } from '@/lib/qlib';
import { Eye, EyeOff } from 'lucide-react';
import { useGenericApi } from '@/hooks/useGenericApi';
import { 
  activeClientsService, 
  ActiveClientStep1Data, 
  ActiveClientCompleteData 
} from '@/services/activeClientsService';

/**
 * Schema de validação para a primeira etapa (dados pessoais)
 */
const step1Schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Número de telefone é obrigatório'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com os Termos de Uso'
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com a Política de Privacidade'
  })
});

/**
 * Schema de validação para a segunda etapa (definir senha)
 */
const step2Schema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória')
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

/**
 * Componente da landing page pública para cadastro de clientes
 */
export default function PublicClientForm() {
  const { cpf } = useParams<{ cpf: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<ActiveClientStep1Data | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  console.log('ActiveClientsService',activeClientsService);
  
  // Usar o hook genérico
  const clientsApi = useGenericApi({
    service: activeClientsService,
    queryKey: 'activeClients',
    entityName: 'Cliente'
  });

  const createMutation = clientsApi.useCreate({
    onSuccess: (data) => {
      setStep1Data(step1Form.getValues());
      setCurrentStep(2);
      toast.success('Dados verificados! Agora defina sua senha.');
    },
    onError: (error) => {
      console.error('Erro na primeira etapa:', error);
      toast.error('Erro ao verificar dados. Tente novamente.');
    }
  });

  const updateMutation = clientsApi.useUpdate({
    onSuccess: (data) => {
      toast.success('Conta criada com sucesso!');
      step1Form.reset();
      step2Form.reset();
      setCurrentStep(1);
      setStep1Data(null);
    },
    onError: (error) => {
      console.error('Erro na segunda etapa:', error);
      toast.error('Erro ao criar senha. Tente novamente.');
    }
  });

  // Estado de loading das mutations
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      cpf: mascaraCpf(cpf || ''),
      email: '',
      phone: '',
      termsAccepted: false,
      privacyAccepted: false
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
  });

  /**
   * Função para submeter a primeira etapa (verificação e cadastro)
   */
  const onSubmitStep1 = async (data: Step1FormData) => {
    createMutation.mutate(data);
  };

  /**
   * Função para submeter a segunda etapa (definir senha)
   */
  const onSubmitStep2 = async (data: Step2FormData) => {
    if (!step1Data) {
      toast.error('Dados da primeira etapa não encontrados');
      return;
    }

    const completeData: ActiveClientCompleteData = {
      ...step1Data,
      password: data.password
    };

    // Como não temos um ID específico, usamos um placeholder
    // O serviço vai ignorar o ID e usar os dados completos
    updateMutation.mutate({ id: 'active-client', data: completeData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-purple-300/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-purple-200/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 flex w-full max-w-6xl mx-auto">
        {/* Lado esquerdo - Ícone e elementos decorativos */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
          <div className="text-center">
            {/* Ícone principal */}
            <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/20">
              <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
                <svg className="w-20 h-20 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  <path d="M19 14v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-lg">Y</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar conta</h1>
            </div>

            {/* Abas */}
            <div className="flex mb-6">
              <div className="flex-1 text-center">
                <button 
                  className={`w-full pb-2 font-medium border-b-2 ${
                    currentStep === 1 
                      ? 'text-purple-600 border-purple-600' 
                      : 'text-gray-400 border-gray-200'
                  }`}
                >
                  Dados pessoais
                </button>
              </div>
              <div className="flex-1 text-center">
                <button 
                  className={`w-full pb-2 font-medium border-b-2 ${
                    currentStep === 2 
                      ? 'text-purple-600 border-purple-600' 
                      : 'text-gray-400 border-gray-200'
                  }`}
                >
                  Definir senha
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {currentStep === 1 
                ? 'Precisamos de algumas informações para criar sua conta'
                : 'Agora defina uma senha segura para sua conta'
              }
            </p>

            {currentStep === 1 ? (
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-4">
                  <FormField
                    control={step1Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nome completo*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">CPF*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CPF"
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">E-mail*</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="E-mail"
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Número de telefone*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número de telefone"
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Checkboxes de termos */}
                  <div className="space-y-3 pt-2">
                    <FormField
                      control={step1Form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              Ao criar uma conta, você concorda com os{' '}
                              <span className="text-purple-600 underline cursor-pointer">
                                Termos de Uso
                              </span>
                            </FormLabel>
                            <FormMessage className="text-red-500 text-xs" />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step1Form.control}
                      name="privacyAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              Ao criar uma conta, você concorda com a{' '}
                              <span className="text-purple-600 underline cursor-pointer">
                                Política de Privacidade
                              </span>
                            </FormLabel>
                            <FormMessage className="text-red-500 text-xs" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg mt-6"
                  >
                    {isSubmitting ? 'Verificando...' : 'Continuar'}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="text-purple-600 text-sm underline"
                    >
                      Fazer Login
                    </button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-4">
                  <FormField
                    control={step2Form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Senha*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Digite sua senha"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step2Form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Confirmar senha*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirme sua senha"
                              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    >
                      {isSubmitting ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}