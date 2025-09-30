import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  ClipboardList,
  Phone,
  Mail,
  Pencil
} from "lucide-react";
import { cn } from '@/lib/utils';
import { 
  useClientsList, 
  useCreateClient, 
  useUpdateClient,
  useDeleteClient
} from '@/hooks/clients';
import { ClientRecord, CreateClientInput } from '@/types/clients';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientsTable } from '@/components/clients/ClientsTable';

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
  ativo: z.enum(["actived", "inactived", "pre_registred"], {
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

// Brazilian states for the select dropdown
const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function Clients() {
  // State for search, dialogs, and client operations
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();

  // React Query hooks for client operations
  const clientsQuery = useClientsList({
    page: currentPage,
    per_page: pageSize,
  });
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Form setup with zod validation
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipo_pessoa: "pf",
      email: "",
      name: "",
      cpf: "",
      cnpj: "",
      razao: "",
      genero: "ni",
      ativo: "actived",
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

  const handleNewClient = () => {
    setEditingClient(null);
    form.reset({
      tipo_pessoa: "pf",
      email: "",
      name: "",
      cpf: "",
      cnpj: "",
      razao: "",
      genero: "ni",
      ativo: "s",
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
    });
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: ClientRecord) => {
    setEditingClient(client);
    form.reset({
      tipo_pessoa: client.tipo_pessoa,
      email: client.email,
      name: client.name,
      cpf: client.cpf || "",
      cnpj: client.cnpj || "",
      razao: client.razao || "",
      genero: client.genero,
      ativo: client.ativo,
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
    setIsDialogOpen(true);
  };
  
  const handleDeleteClient = (client: ClientRecord) => {
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };
  
  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          toast({
            title: "Cliente excluído",
            description: "Cliente excluído com sucesso",
          });
          setOpenDeleteDialog(false);
          setClientToDelete(null);
        },
        onError: (error) => {
          toast({
            title: "Erro ao excluir cliente",
            description: `Ocorreu um erro: ${error.message}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const onSubmit = (data: ClientFormData) => {
    const clientData = {
      tipo_pessoa: data.tipo_pessoa,
      email: data.email,
      name: data.name,
      cpf: data.tipo_pessoa === 'pf' ? data.cpf : undefined,
      cnpj: data.tipo_pessoa === 'pj' ? data.cnpj : undefined,
      razao: data.tipo_pessoa === 'pj' ? data.razao : undefined,
      genero: data.genero,
      ativo: data.ativo,
      autor: data.autor,
      config: data.config,
    };
    
    if (editingClient) {
      updateClientMutation.mutate(
        {
          id: editingClient.id,
          data: clientData
        },
        {
          onSuccess: () => {
            toast({
              title: "Cliente atualizado",
              description: `Cliente ${data.name} atualizado com sucesso`,
            });
            setIsDialogOpen(false);
            setEditingClient(null);
            form.reset();
          },
          onError: (error) => {
            toast({
              title: "Erro ao atualizar cliente",
              description: `Ocorreu um erro: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createClientMutation.mutate(
        clientData as CreateClientInput,
        {
          onSuccess: () => {
            toast({
              title: "Cliente criado",
              description: `Cliente ${data.name} criado com sucesso`,
            });
            setIsDialogOpen(false);
            form.reset();
          },
          onError: (error) => {
            toast({
              title: "Erro ao criar cliente",
              description: `Ocorreu um erro: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const onCancel = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
  };

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!clientsQuery.data?.data) return [];
    
    const searchTermLower = searchTerm.toLowerCase();
    return clientsQuery.data.data.filter((client) => {
      const document = client.tipo_pessoa === 'pf' ? client.cpf : client.cnpj;
      return (
        client.name.toLowerCase().includes(searchTermLower) ||
        (client.email && client.email.toLowerCase().includes(searchTermLower)) ||
        (document && document.toLowerCase().includes(searchTermLower))
      );
    });
  }, [clientsQuery.data, searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={handleNewClient}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.ativo === 'actived').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes com status ativo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Física</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.tipo_pessoa === 'pf').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes pessoa física
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pessoa Jurídica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsQuery.data?.data?.filter(client => client.tipo_pessoa === 'pj').length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes pessoa jurídica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes, visualize informações e histórico de atividades.
          </CardDescription>
          <div className="flex items-center mt-4">
            <Search className="h-4 w-4 mr-2 opacity-50" />
            <Input
              placeholder="Buscar por nome, email ou documento..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {clientsQuery.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : clientsQuery.isError ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <p>Erro ao carregar clientes: {clientsQuery.error.message}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <ClientsTable 
              clients={filteredClients}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onView={(client) => navigate(`/clients/${client.id}`)}
              isLoading={clientsQuery.isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Atualize as informações do cliente no formulário abaixo."
                : "Preencha as informações do novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClientForm form={form} onSubmit={onSubmit} onCancel={onCancel} editingClient={editingClient} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente {clientToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}