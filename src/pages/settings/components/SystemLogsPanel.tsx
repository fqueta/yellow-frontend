import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Eye, RefreshCw, AlertCircle, CheckCircle2, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { systemLogService, SystemLog } from "@/services/systemLogService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function SystemLogsPanel() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [pagination, setPagination] = useState({ current: 1, last: 1 });
  
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLogs(1);
  }, [filterStatus, filterEvent]);

  const fetchLogs = async (page: number) => {
    setIsLoading(true);
    try {
      const params: any = { page, per_page: 20 };
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterEvent !== "all") params.event_type = filterEvent;
      
      const response = await systemLogService.getLogs(params);
      setLogs(response.data);
      setPagination({
        current: response.current_page,
        last: response.last_page
      });
    } catch (error) {
      console.error("Erro ao carregar os logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Sucesso</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="w-3 h-3 mr-1"/> Aviso</Badge>;
      case 'error':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="w-3 h-3 mr-1"/> Erro</Badge>;
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Info className="w-3 h-3 mr-1"/> Info</Badge>;
    }
  };

  const getEventName = (event: string) => {
    switch (event) {
      case 'point_expiration_daily': return 'Expiração Diária';
      case 'point_expiration_retroactive': return 'Expiração Retroativa';
      case 'email_notification': return 'Envio de Email';
      case 'email_notification_failed': return 'Falha de Email';
      case 'admin_notification_start': return 'Notificação de Admin (Início)';
      case 'admin_notification_skip': return 'Notificação de Admin (Pulada)';
      default: return event;
    }
  };

  const viewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  return (
    <Card className="col-span-1 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-slate-50/50 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Activity className="h-5 w-5" />
              <span>Logs do Sistema</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Acompanhe o resultado das tarefas executadas em background.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(pagination.current)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="bg-muted/30 p-4 border-y flex gap-4 flex-wrap">
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-56">
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eventos</SelectItem>
                <SelectItem value="point_expiration_daily">Expiração Diária</SelectItem>
                <SelectItem value="point_expiration_retroactive">Expiração Retroativa</SelectItem>
                <SelectItem value="email_notification">Envio de Email (Sucesso)</SelectItem>
                <SelectItem value="email_notification_failed">Envio de Email (Erro)</SelectItem>
                <SelectItem value="admin_notification_start">Notificação de Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="w-[180px]">Data / Hora</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/50" />
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground bg-slate-50/30">
                    Nenhum log encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {getEventName(log.event_type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500 max-w-sm truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewDetails(log)} className="hover:bg-primary/10 hover:text-primary">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver MTD
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {pagination.last > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Página {pagination.current} de {pagination.last}
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchLogs(pagination.current - 1)}
                disabled={pagination.current === 1 || isLoading}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchLogs(pagination.current + 1)}
                disabled={pagination.current === pagination.last || isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Detalhes do Evento: {selectedLog ? getEventName(selectedLog.event_type) : ''}</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas e metadados capturados durante a execução.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">Data/Hora:</span>
                  <p className="font-semibold text-slate-800">{format(new Date(selectedLog.created_at), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm:ss", { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500">Status:</span>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-3 rounded-md border border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-500">Descrição:</span>
                    <p className="text-slate-700">{selectedLog.description}</p>
                  </div>
                  {selectedLog.metadata?.batch_id && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap"
                      onClick={() => {
                        setIsDialogOpen(false);
                        navigate(`/admin/points-extracts?batch_id=${selectedLog.metadata.batch_id}`);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Ver registros deste lote
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-500">Metadata (JSON):</span>
                <div className="bg-slate-900 rounded-md p-4 overflow-hidden">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                    {selectedLog.metadata ? JSON.stringify(selectedLog.metadata, null, 2) : 'Nenhum metadado disponível.'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
