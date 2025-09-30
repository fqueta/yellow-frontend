import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientRecord } from '@/types/clients';
import { useUsersList } from '@/hooks/users';
interface ClientsTableProps {
  clients: ClientRecord[];
  onEdit: (client: ClientRecord) => void;
  onDelete: (client: ClientRecord) => void;
  onView?: (client: ClientRecord) => void;
  isLoading: boolean;
}

export function ClientsTable({ clients, onEdit, onDelete, onView, isLoading }: ClientsTableProps) {
  // Garantir que clients seja sempre um array válido
  const clientsList = Array.isArray(clients) ? clients : [];
  
  // Buscar lista de usuários para identificar o proprietário
  const { data: usersData } = useUsersList();
  const usersList = usersData?.data || [];
  
  // Função para obter o nome do proprietário pelo ID do autor
  const getOwnerName = (autorId: string) => {
    const user = usersList.find(user => user.id === autorId);
    return user?.name || 'Não identificado';
  };
  
  // Função para formatar o status
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'actived': { label: 'Ativo', variant: 'default' as const },
      'inactived': { label: 'Inativo', variant: 'destructive' as const },
      'pre_registred': { label: 'Pré-cadastro', variant: 'secondary' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status || 'Não definido', variant: 'outline' as const };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Carregando clientes...</div>;
  }
  
  if (clientsList.length === 0) {
    return <div className="text-center py-4">Nenhum cliente encontrado</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Proprietário</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientsList.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>
              {client.tipo_pessoa === 'pf' ? (client.cpf || 'Não informado') : (client.cnpj || 'Não informado')}
            </TableCell>
            <TableCell>{client.email || 'Não informado'}</TableCell>
            <TableCell>{getOwnerName(client.autor)}</TableCell>
            <TableCell>
              {/* Debug temporário */}
              <div style={{fontSize: '10px', color: 'gray', marginBottom: '4px'}}>
                Debug: {JSON.stringify({ativo: client.ativo, type: typeof client.ativo})}
              </div>
              {getStatusBadge(client.ativo)}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(client)}>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(client)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(client)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}