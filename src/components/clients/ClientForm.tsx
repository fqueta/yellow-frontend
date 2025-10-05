import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useCallback, useState } from 'react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { MaskedInputField } from '@/components/lib/MaskedInputField';
import { useCep } from '@/hooks/useCep';
import { SmartDocumentInput } from '@/components/lib/SmartDocumentInput';
import { ImageUpload } from '@/components/lib/ImageUpload';
import { useUsersPropertys } from '@/hooks/users';
interface ClientFormProps {
  form: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingClient: any;
}

export function ClientForm({
  form,
  onSubmit,
  onCancel,
  editingClient,
}: ClientFormProps) {
  const tipoPessoa = form.watch('tipo_pessoa');
  const { fetchCep, loading: cepLoading } = useCep();
  const { data: usersPropertys, isLoading: isLoadingUsers } = useUsersPropertys();
  const usersList = usersPropertys || [];
  
  // Watch para validação em tempo real
  const emailWatch = form.watch("email");
  const nameWatch = form.watch("name");
  const cpfWatch = form.watch("cpf");
  const cnpjWatch = form.watch("cnpj");
  const cepWatch = form.watch("config.cep");
  
  // Estados para mensagens de erro em tempo real
  const [emailError, setEmailError] = useState<string>('')
  const [nameError, setNameError] = useState<string>('')

  /**
    * Função para buscar CEP e preencher campos de endereço automaticamente
    * @param cep CEP digitado pelo usuário
    */
   const handleCepBlur = async (cep: string) => {
     if (cep && cep.replace(/\D/g, '').length === 8) {
       const addressData = await fetchCep(cep);
       if (addressData) {
         // Preenche os campos de endereço automaticamente
         form.setValue('config.endereco', addressData.endereco);
         form.setValue('config.bairro', addressData.bairro);
         form.setValue('config.cidade', addressData.cidade);
         form.setValue('config.uf', addressData.uf);
       }
     }
   };

   /**
    * Função para validar email em tempo real
    * @param email Email para validação
    */
   const validateEmailRealTime = useCallback(
     debounce((email: string) => {
       if (email) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           setEmailError('Email inválido');
           form.setError('email', {
             type: 'manual',
             message: 'Email inválido'
           });
         } else {
           setEmailError('');
           form.clearErrors('email');
         }
       } else {
         setEmailError('');
       }
     }, 500),
     [form]
   );

   /**
    * Função para validar nome em tempo real
    * @param name Nome para validação
    */
   const validateNameRealTime = useCallback(
     debounce((name: string) => {
       if (name) {
         if (name.length < 2) {
           setNameError('Nome deve ter pelo menos 2 caracteres');
           form.setError('name', {
             type: 'manual',
             message: 'Nome deve ter pelo menos 2 caracteres'
           });
         } else if (name.length > 100) {
           setNameError('Nome deve ter no máximo 100 caracteres');
           form.setError('name', {
             type: 'manual',
             message: 'Nome deve ter no máximo 100 caracteres'
           });
         } else {
           setNameError('');
           form.clearErrors('name');
         }
       } else {
         setNameError('');
       }
     }, 300),
     [form]
   );

   // Efeitos para validação em tempo real
   useEffect(() => {
     if (emailWatch) {
       validateEmailRealTime(emailWatch);
     }
   }, [emailWatch, validateEmailRealTime]);

   useEffect(() => {
     if (nameWatch) {
       validateNameRealTime(nameWatch);
     }
   }, [nameWatch, validateNameRealTime]);

   // Cleanup dos debounces
   useEffect(() => {
     return () => {
       validateEmailRealTime.cancel();
       validateNameRealTime.cancel();
     };
   }, [validateEmailRealTime, validateNameRealTime]);
  // console.log('Status inicial:', form.getValues());
  return (
    <div className="space-y-8">
        {/* Seção: Informações Básicas */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="tipo_pessoa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Tipo de Pessoa *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {tipoPessoa === 'pj' ? 'Razão Social *' : 'Nome Completo *'}
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder={tipoPessoa === 'pj' ? 'Razão social da empresa' : 'Nome completo'} 
                        {...field} 
                        value={field.value || ''}
                        className="h-11"
                      />
                    </FormControl>
                    {nameWatch && nameWatch.length >= 2 && !nameError && (
                       <div className="absolute right-3 top-3 flex items-center">
                         <CheckCircle className="h-4 w-4 text-green-600" />
                       </div>
                     )}
                     {nameError && (
                       <div className="absolute right-3 top-3 flex items-center">
                         <AlertCircle className="h-4 w-4 text-red-600" />
                       </div>
                     )}
                  </div>
                   {nameError && (
                     <div className="mt-1 flex items-center text-sm text-red-600">
                       <AlertCircle className="h-3 w-3 mr-1" />
                       <span>{nameError}</span>
                     </div>
                   )}
                   <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder="email@exemplo.com" 
                        type="email" 
                        {...field} 
                        value={field.value || ''}
                        className="h-11"
                      />
                    </FormControl>
                    {emailWatch && emailWatch.includes('@') && !emailError && (
                       <div className="absolute right-3 top-3 flex items-center">
                         <CheckCircle className="h-4 w-4 text-green-600" />
                       </div>
                     )}
                     {emailError && (
                       <div className="absolute right-3 top-3 flex items-center">
                         <AlertCircle className="h-4 w-4 text-red-600" />
                       </div>
                     )}
                  </div>
                   {emailError && (
                     <div className="mt-1 flex items-center text-sm text-red-600">
                       <AlertCircle className="h-3 w-3 mr-1" />
                       <span>{emailError}</span>
                     </div>
                   )}
                   <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="actived">Ativo</SelectItem>
                      <SelectItem value="inactived">Inativo</SelectItem>
                      <SelectItem value="pre_registred">Pré-cadastro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="autor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Proprietário</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o proprietário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="__loading__" disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </SelectItem>
                      ) : usersList.length === 0 ? (
                        <SelectItem value="__no_users__" disabled>
                          Nenhum usuário cadastrado
                        </SelectItem>
                      ) : (
                        usersList.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Senha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite a senha (opcional)" 
                      type="password" 
                      {...field} 
                      value={field.value || ''}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seção: Documentos e Identificação */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Documentos e Identificação
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {tipoPessoa === 'pf' && (
              <>
                <SmartDocumentInput 
                  name="cpf"
                  control={form.control}
                  label="CPF"
                  tipoPessoa={tipoPessoa}
                />
                
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Gênero *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m">Masculino</SelectItem>
                          <SelectItem value="f">Feminino</SelectItem>
                          <SelectItem value="ni">Não informado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="config.rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">RG</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00.000.000-0" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {tipoPessoa === 'pj' && (
              <>
                <SmartDocumentInput 
                  name="cnpj"
                  control={form.control}
                  label="CNPJ"
                  tipoPessoa={tipoPessoa}
                />
                
                <FormField
                  control={form.control}
                  name="razao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Razão Social *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Razão Social" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="config.nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome fantasia" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        <Accordion type="multiple" className="w-full space-y-4">
          {/* Seção: Contatos */}
          <AccordionItem value="contatos" className="bg-gray-50 rounded-lg border px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Informações de Contato
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <MaskedInputField
                    name="config.celular"
                    control={form.control}
                    label="Celular"
                    mask="(dd) ddddd-dddd"
                    placeholder="(00) 00000-0000"
                  />
                  {form.watch('config.celular') && form.watch('config.celular').replace(/\D/g, '').length >= 10 && (
                    <div className="absolute right-3 top-9 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <MaskedInputField
                    name="config.telefone_residencial"
                    control={form.control}
                    label="Telefone Residencial"
                    mask="(dd) dddd-dddd"
                    placeholder="(00) 0000-0000"
                  />
                  {form.watch('config.telefone_residencial') && form.watch('config.telefone_residencial').replace(/\D/g, '').length >= 10 && (
                    <div className="absolute right-3 top-9 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seção: Informações Pessoais/Profissionais */}
          {tipoPessoa === 'pf' && (
            <AccordionItem value="pessoais" className="bg-gray-50 rounded-lg border px-6">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Informações Pessoais
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="config.nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ''}
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="config.escolaridade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Escolaridade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Escolaridade"
                            {...field}
                            value={field.value || ''}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="config.profissao"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel className="text-sm font-medium text-gray-700">Profissão</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Profissão"
                            {...field}
                            value={field.value || ''}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Seção: Informações da Empresa */}
          {tipoPessoa === 'pj' && (
            <AccordionItem value="empresa" className="bg-gray-50 rounded-lg border px-6">
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Informações da Empresa
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="config.tipo_pj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Tipo de Empresa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tipo de Empresa"
                            {...field}
                            value={field.value || ''}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {/* Seção: Endereço */}
          <AccordionItem value="endereco" className="bg-gray-50 rounded-lg border px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Endereço
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                <div className="relative">
                  <MaskedInputField 
                    name="config.cep"
                    control={form.control}
                    label="CEP"
                    mask="ddddd-ddd"
                    placeholder="00000-000"
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    disabled={cepLoading}
                  />
                  {cepLoading && (
                    <div className="absolute right-3 top-9 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="ml-2 text-sm text-purple-600">Buscando...</span>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="config.endereco"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel className="text-sm font-medium text-gray-700">Endereço</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Rua, Avenida, etc." 
                            {...field} 
                            value={field.value || ''} 
                            className="h-11"
                          />
                        </FormControl>
                        {form.watch('config.endereco') && form.watch('config.endereco').length >= 5 && (
                          <div className="absolute right-3 top-3 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Número</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="config.complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Complemento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Apto, Bloco, etc." 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bairro" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Cidade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cidade" 
                          {...field} 
                          value={field.value || ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="config.uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">UF</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Seção: Foto */}
          {/* <AccordionItem value="foto" className="bg-gray-50 rounded-lg border px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                Foto do Cliente
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="mt-4">
                <FormField
                   control={form.control}
                   name="config.foto"
                   render={({ field }) => (
                     <ImageUpload
                       name="config.foto"
                       label="Foto do Cliente"
                       value={field.value || ''}
                       onChange={field.onChange}
                       maxSize={2}
                       className="max-w-md"
                     />
                   )}
                 />
              </div>
            </AccordionContent>
          </AccordionItem> */}

          {/* Seção: Observações */}
          <AccordionItem value="observacoes" className="bg-gray-50 rounded-lg border px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Observações
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="config.observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações sobre o cliente..." 
                          className="min-h-[120px] resize-none" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingClient ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
    </div>
  );
}