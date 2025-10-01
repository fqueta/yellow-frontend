import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { 
  useClientById, 
  useUpdateClient
} from '@/hooks/clients';
import { ClientRecord, UpdateClientInput } from '@/types/clients';
import { ClientForm } from "@/components/clients/ClientForm";
import { useAuth } from '@/contexts/AuthContext';

/**
 * Validação de CPF
 * @param cpf CPF a ser validado
 * @returns true se o CPF for válido
 */
const isValidCPF = (cpf: string): boolean => {
  if (!cpf) return true; // CPF é opcional em alguns casos
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCpf.charAt(10));
};

/**
 * Validação de CNPJ
 * @param cnpj CNPJ a ser validado
 * @returns true se o CNPJ for válido
 */
const isValidCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return true; // CNPJ é opcional em alguns casos
  const cleanCnpj = cnpj.replace(/\D/g, '');
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCnpj.charAt(12))) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cleanCnpj.charAt(13));
};

/**
 * Validação de telefone
 * @param phone Telefone a ser validado
 * @returns true se o telefone for válido
 */
const isValidPhone = (phone: string): boolean => {
  return !phone || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone);
};

/**
 * Validação de CEP
 * @param cep CEP a ser validado
 * @returns true se o CEP for válido
 */
const isValidCEP = (cep: string): boolean => {
  return !cep || /^\d{5}-\d{3}$/.test(cep);
};

// Schema de validação do formulário
const clientSchema = z.object({
  tipo_pessoa: z.enum(["pf", "pj"], {
    errorMap: () => ({ message: "Selecione o tipo de pessoa" })
  }),
  email: z.string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido")
    .max(100, "Email deve ter no máximo 100 caracteres"),
  password: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return val.length >= 6;
  }, "Senha deve ter pelo menos 6 caracteres").refine((val) => {
    if (!val || val.trim() === '') return true;
    return val.length <= 50;
  }, "Senha deve ter no máximo 50 caracteres"),
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  cpf: z.string().optional().refine((val) => {
    return isValidCPF(val || "");
  }, "CPF inválido"),
  cnpj: z.string().optional().refine((val) => {
    return isValidCNPJ(val || "");
  }, "CNPJ inválido"),
  razao: z.string().optional(),
  genero: z.enum(["m", "f", "ni"], {
    errorMap: () => ({ message: "Selecione o gênero" })
  }),
  status: z.enum(["actived", "inactived", "pre_registred"], {
    errorMap: () => ({ message: "Selecione o status" })
  }),
  autor: z.string().optional(),
  config: z.object({
    nome_fantasia: z.string().nullable().optional(),
    celular: z.string().nullable().optional().refine((val) => {
      return isValidPhone(val || "");
    }, "Número de celular inválido"),
    telefone_residencial: z.string().nullable().optional().refine((val) => {
      return isValidPhone(val || "");
    }, "Número de telefone residencial inválido"),
    rg: z.string().nullable().optional().refine((val) => {
      if (!val) return true;
      const cleanRg = val.replace(/\D/g, '');
      return cleanRg.length >= 7 && cleanRg.length <= 9;
    }, "RG deve ter entre 7 e 9 dígitos"),
    nascimento: z.string().nullable().optional().refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      return date <= today;
    }, "Data de nascimento inválida"),
    escolaridade: z.string().nullable().optional(),
    profissao: z.string().nullable().optional(),
    tipo_pj: z.string().nullable().optional(),
    cep: z.string().nullable().optional().refine((val) => {
      return isValidCEP(val || "");
    }, "CEP deve ter 8 dígitos"),
    endereco: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    cidade: z.string().nullable().optional().refine((val) => {
      return !val || /^[a-zA-ZÀ-ÿ\s]+$/.test(val);
    }, "Cidade deve conter apenas letras e espaços"),
    uf: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional().refine((val) => {
      return !val || val.length <= 500;
    }, "Observações devem ter no máximo 500 caracteres"),
  }),
}).refine((data) => {
  if (data.tipo_pessoa === 'pf') {
    return data.cpf && data.cpf.trim() !== '';
  } else if (data.tipo_pessoa === 'pj') {
    return data.cnpj && data.cnpj.trim() !== '' && data.razao && data.razao.trim() !== '';
  }
  return true;
}, {
  message: "CPF é obrigatório para Pessoa Física. CNPJ e Razão Social são obrigatórios para Pessoa Jurídica.",
  path: ['tipo_pessoa']
});

type ClientFormData = z.infer<typeof clientSchema>;

/**
 * Página de edição de cliente
 * Permite editar os dados de um cliente existente em uma página dedicada
 */
export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Hooks para buscar e atualizar cliente
  const { data: clientResponse, isLoading: isLoadingClient, error } = useClientById(id!);
  const updateClientMutation = useUpdateClient();
  
  const client = clientResponse?.data;
  
  // Form setup com validação Zod
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipo_pessoa: "pf",
      email: "",
      password: "",
      name: "",
      cpf: "",
      cnpj: "",
      razao: "",
      genero: "ni",
      status: "actived",
      autor: "",
      config: {
        nome_fantasia: "",
        celular: "",
        telefone_residencial: "",
        rg: "",
        nascimento: "",
        escolaridade: "",
        profissao: "",
        tipo_pj: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        observacoes: "",
      },
    },
  });

  // Preenche o formulário quando os dados do cliente são carregados
  useEffect(() => {
    if (client) {
      
      form.reset({
        tipo_pessoa: client.tipo_pessoa,
        email: client.email,
        password: "",
        name: client.name,
        cpf: client.cpf || "",
        cnpj: client.cnpj || "",
        razao: client.razao || "",
        genero: client.genero,
        status: client.status,
        autor: client.autor || "",
        config: {
          nome_fantasia: client.config?.nome_fantasia || "",
          celular: client.config?.celular || "",
          telefone_residencial: client.config?.telefone_residencial || "",
          rg: client.config?.rg || "",
          nascimento: client.config?.nascimento || "",
          escolaridade: client.config?.escolaridade || "",
          profissao: client.config?.profissao || "",
          tipo_pj: client.config?.tipo_pj || "",
          cep: client.config?.cep || "",
          endereco: client.config?.endereco || "",
          numero: client.config?.numero || "",
          complemento: client.config?.complemento || "",
          bairro: client.config?.bairro || "",
          cidade: client.config?.cidade || "",
          uf: client.config?.uf || "",
          observacoes: client.config?.observacoes || "",
        },
      });
      
      // Se o autor estiver vazio, define o usuário logado como padrão
      if (!client.autor && user?.id) {
        form.setValue('autor', user.id);
      }
    }
  }, [client, form, user]);

  /**
   * Função para submeter o formulário de edição
   * @param data Dados do formulário validados
   */
  const onSubmit = (data: ClientFormData) => {
    
    setIsLoading(true);
    
    const clientData: UpdateClientInput = {
      tipo_pessoa: data.tipo_pessoa,
      email: data.email,
      ...(data.password && data.password.trim() !== '' && { password: data.password }),
      name: data.name,
      cpf: data.tipo_pessoa === 'pf' ? data.cpf : undefined,
      cnpj: data.tipo_pessoa === 'pj' ? data.cnpj : undefined,
      razao: data.tipo_pessoa === 'pj' ? data.razao : undefined,
      genero: data.genero,
      status: data.status,
      autor: data.autor,
      config: data.config,
    };
    
    // console.log('Dados enviados para API:', clientData);

    updateClientMutation.mutate(
      {
        id: id!,
        data: clientData
      },
      {
        onSuccess: () => {
          toast({
            title: "Cliente atualizado",
            description: `Cliente ${data.name} atualizado com sucesso`,
          });
          setIsLoading(false);
          navigate('/clients');
        },
        onError: (error) => {
          // Função para determinar mensagem de erro específica
          const getErrorMessage = () => {
            const errorWithStatus = error as Error & { status?: number };
            
            switch (errorWithStatus.status) {
              case 400:
                return "Dados inválidos. Verifique as informações preenchidas.";
              case 404:
                return "Cliente não encontrado. Pode ter sido removido por outro usuário.";
              case 409:
                return "Já existe um cliente com este CPF/CNPJ ou email.";
              case 422:
                return "Dados não processáveis. Verifique os campos obrigatórios.";
              case 500:
                return "Erro interno do servidor. Tente novamente em alguns minutos.";
              case 403:
                return "Você não tem permissão para editar este cliente.";
              case 401:
                return "Sua sessão expirou. Faça login novamente.";
              default:
                return error.message || "Ocorreu um erro inesperado ao atualizar o cliente.";
            }
          };
          
          toast({
            title: "Erro ao atualizar cliente",
            description: getErrorMessage(),
            variant: "destructive",
          });
          setIsLoading(false);
        },
      }
    );
  };

  /**
   * Função para cancelar a edição e voltar para a lista
   */
  const handleCancel = () => {
    navigate('/clients');
  };

  // Estados de carregamento e erro
  if (isLoadingClient) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600">Carregando dados do cliente...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Função para determinar o tipo de erro e mensagem apropriada
  const getErrorInfo = () => {
    if (!error && !client && !isLoading) {
      return {
        title: 'Cliente não encontrado',
        message: 'O cliente solicitado não foi encontrado ou não existe.',
        type: 'not-found'
      };
    }
    
    if (error) {
      const errorWithStatus = error as Error & { status?: number };
      
      switch (errorWithStatus.status) {
        case 404:
          return {
            title: 'Cliente não encontrado',
            message: 'O cliente com este ID não existe no sistema.',
            type: 'not-found'
          };
        case 500:
          return {
            title: 'Erro interno do servidor',
            message: 'Ocorreu um erro interno no servidor. Tente novamente em alguns minutos ou entre em contato com o suporte.',
            type: 'server-error'
          };
        case 403:
          return {
            title: 'Acesso negado',
            message: 'Você não tem permissão para acessar este cliente.',
            type: 'forbidden'
          };
        case 401:
          return {
            title: 'Não autorizado',
            message: 'Sua sessão expirou. Faça login novamente.',
            type: 'unauthorized'
          };
        default:
          return {
            title: 'Erro ao carregar cliente',
            message: error.message || 'Ocorreu um erro inesperado ao carregar os dados do cliente.',
            type: 'generic'
          };
      }
    }
    
    return null;
  };

  const errorInfo = getErrorInfo();
  
  if (errorInfo) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Ícone baseado no tipo de erro */}
              <div className="flex justify-center">
                {errorInfo.type === 'server-error' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
                {errorInfo.type === 'not-found' && (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.935-6.072-2.456M15 21H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                {(errorInfo.type === 'forbidden' || errorInfo.type === 'unauthorized') && (
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
                {errorInfo.type === 'generic' && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{errorInfo.title}</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {errorInfo.message}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/clients')} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para lista
                </Button>
                
                {errorInfo.type === 'server-error' && (
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="default"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Tentar novamente
                  </Button>
                )}
                
                {errorInfo.type === 'unauthorized' && (
                  <Button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/auth/login';
                    }} 
                    variant="default"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Fazer login
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
            <p className="text-gray-600">Edite as informações do cliente {client.name}</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>
            Atualize as informações do cliente. Todos os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ClientForm
                form={form}
                onSubmit={onSubmit}
                onCancel={handleCancel}
                editingClient={client}
              />
            
            {/* Botões de ação */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
             </div>
           </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}