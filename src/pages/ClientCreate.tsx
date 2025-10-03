import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useCreateClient } from '@/hooks/clients';
import { CreateClientInput } from '@/types/clients';
import { ClientForm } from '@/components/clients/ClientForm';
import { useAuth } from '@/contexts/AuthContext';

// Utility functions for validation
const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

const isValidCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cleanCNPJ.charAt(13));
};

const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

const isValidCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

// Enhanced form validation schema
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
    if (!val || val.trim() === '') return true;
    return isValidCPF(val);
  }, "CPF inválido"),
  cnpj: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return isValidCNPJ(val);
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
      if (!val || val.trim() === '') return true;
      return isValidPhone(val);
    }, "Número de celular inválido"),
    telefone_residencial: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      return isValidPhone(val);
    }, "Número de telefone residencial inválido"),
    rg: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      const cleanRG = val.replace(/\D/g, '');
      return cleanRG.length >= 7 && cleanRG.length <= 9;
    }, "RG deve ter entre 7 e 9 dígitos"),
    nascimento: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      const birthDate = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, "Data de nascimento inválida"),
    escolaridade: z.string().nullable().optional(),
    profissao: z.string().nullable().optional(),
    tipo_pj: z.string().nullable().optional(),
    cep: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      return isValidCEP(val);
    }, "CEP deve ter 8 dígitos"),
    endereco: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    cidade: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      return /^[a-zA-ZÀ-ÿ\s]+$/.test(val);
    }, "Cidade deve conter apenas letras e espaços"),
    uf: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      return val.length <= 500;
    }, "Observações devem ter no máximo 500 caracteres"),
  }),
}).refine((data) => {
  // Conditional validation: CPF required for PF, CNPJ and razao required for PJ
  if (data.tipo_pessoa === 'pf') {
    return data.cpf && data.cpf.trim() !== '';
  }
  if (data.tipo_pessoa === 'pj') {
    return data.cnpj && data.cnpj.trim() !== '' && data.razao && data.razao.trim() !== '';
  }
  return true;
}, {
  message: "CPF é obrigatório para Pessoa Física. CNPJ e Razão Social são obrigatórios para Pessoa Jurídica.",
  path: ['tipo_pessoa']
});

type ClientFormData = z.infer<typeof clientSchema>;

/**
 * Página para criação de novos clientes
 * Permite cadastrar um novo cliente com todas as informações necessárias
 */
export default function ClientCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createClientMutation = useCreateClient();

  // Form setup with zod validation
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

  // Define o usuário logado como autor padrão
  useEffect(() => {
    if (user?.id) {
      form.setValue('autor', user.id);
    }
  }, [user, form]);

  /**
   * Manipula o envio do formulário de criação de cliente
   * @param data - Dados do formulário validados pelo Zod
   */
  const onSubmit = (data: ClientFormData) => {
    const clientData = {
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
    
    createClientMutation.mutate(
      clientData as CreateClientInput,
      {
        onSuccess: () => {
          toast({
            title: "Cliente criado",
            description: `Cliente ${data.name} criado com sucesso`,
          });
          navigate('/admin/clients');
        },
        onError: (error) => {
          // Função para determinar mensagem de erro específica
          const getErrorMessage = () => {
            const errorWithStatus = error as Error & { status?: number };
            
            switch (errorWithStatus.status) {
              case 400:
                return "Dados inválidos. Verifique as informações preenchidas.";
              case 409:
                return "Já existe um cliente com este CPF/CNPJ ou email.";
              case 422:
                return "Dados não processáveis. Verifique os campos obrigatórios.";
              case 500:
                return "Erro interno do servidor. Tente novamente em alguns minutos.";
              case 403:
                return "Você não tem permissão para criar clientes.";
              case 401:
                return "Sua sessão expirou. Faça login novamente.";
              default:
                return error.message || "Ocorreu um erro inesperado ao criar o cliente.";
            }
          };
          
          toast({
            title: "Erro ao criar cliente",
            description: getErrorMessage(),
            variant: "destructive",
          });
        },
      }
    );
  };

  /**
   * Manipula o cancelamento da criação
   * Navega de volta para a lista de clientes
   */
  const onCancel = () => {
    navigate('/admin/clients');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/clients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Preencha as informações para cadastrar um novo cliente
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para cadastrar o cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ClientForm
                form={form}
                onSubmit={onSubmit}
                onCancel={onCancel}
                editingClient={null}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}