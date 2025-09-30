export interface ClientConfig {
  nome_fantasia: string;
  celular: string;
  telefone_residencial: string;
  rg: string;
  nascimento: string;
  escolaridade: string;
  profissao: string;
  tipo_pj: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes: string;
}

export interface ClientRecord {
  id: string;
  tipo_pessoa: "pf" | "pj";
  email: string;
  name: string;
  cpf: string | null;
  cnpj: string | null;
  razao: string | null;
  config: ClientConfig;
  genero: "m" | "f" | "ni";
  ativo: "actived" | "inactived" | "pre_registred";
  autor: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientInput {
  tipo_pessoa: "pf" | "pj";
  email: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  razao?: string;
  config: ClientConfig;
  genero: "m" | "f" | "ni";
  ativo: "actived" | "inactived" | "pre_registred";
  autor?: string;
}

export interface UpdateClientInput {
  tipo_pessoa?: "pf" | "pj";
  email?: string;
  name?: string;
  cpf?: string;
  cnpj?: string;
  razao?: string;
  config?: ClientConfig;
  genero?: "m" | "f" | "ni";
  ativo?: "actived" | "inactived" | "pre_registred";
  autor?: string;
}

export interface ClientsListParams {
  search?: string;
  page?: number;
  per_page?: number;
}