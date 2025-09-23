import { useState,useCallback } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { dataParaBR,getInicioFimMes } from '@/lib/qlib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSelector } from '@/components/metrics/PeriodSelector';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { 
  useMetricsList, 
  useCreateMetric, 
  useUpdateMetric,
  useDeleteMetric 
} from '@/hooks/metrics';
import { MetricRecord, CreateMetricInput, MetricList } from '@/types/metrics';
import { metricsService } from '@/services/metricsService';
// Schema de validação
const metricSchema = z.object({
  period: z.string().min(1, "Período é obrigatório"), // yyyy-mm-dd
  investment: z.coerce.number({
    required_error: "O investimento é obrigatório",
    invalid_type_error: "Informe um valor numérico",
  })
  .nonnegative("Não pode ser negativo"),
  visitors: z.number().nonnegative("Visitantes deve ser positivo"),
  bot_conversations: z.number().nonnegative(),
  human_conversations: z.number().nonnegative(),
  proposals: z.number().nonnegative(),
  closed_deals: z.number().nonnegative(),
});

type MetricFormData = z.infer<typeof metricSchema>;
type isLoadingType = boolean;
type errorType = Error | null;
export default function Metrics() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const [activeTab, setActiveTab] = useState('principais');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState<isLoadingType>(false);
  const [error, setError] = useState<errorType>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricRecord  | null>(null);
  const [deletingMetric, setDeletingMetric] = useState<MetricRecord | null>(null);
  const title:string = "Métrica";
  const title1:string = "Métricas";
  const title2:string = "Gerencie as "+title1+" do sistema";
  const label1:string = 'Buscar '+title1+'...';
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // console.log(metricsData);
  
  // useEffect(() => {
  //   // alert('search: ' + search + ', page: ' + page);
  //   // const { data: metricsData, isLoading, error } = useMetricsList({
  //   //   year: new Date().getFullYear(),
  //   //   // search: search,
  //   //   // page,
  //   // });
  // }, [search, page]); // Para garantir que o efeito seja executado quando search ou page mudarem
  const createMutation = useCreateMetric();
  const updateMutation = useUpdateMetric();
  const deleteMutation = useDeleteMetric();

  const form = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      period: "",
      investment: 0,
      visitors: 0,
      bot_conversations: 0,
      human_conversations: 0,
      proposals: 0,
      closed_deals: 0,
    },
  });
  // const [metricsData, setMetricsData] = useState<MetricList>({
  //   registros: [],
  //   agregados: [],
  //   totais_filtrados: {
  //     total_bot_conversations: 0,
  //     total_closed_deals: 0,
  //     total_human_conversations: 0,
  //     total_proposals: 0,
  //     total_visitors: 0,
  //   }
  // });
  const [metrics,setMetrics] = useState<MetricRecord[]>([]);
  const year: number = new Date().getFullYear();
  const currentMonthNumber: number = new Date().getMonth() + 1;
  const [totalPages , setTotalPages] = useState<number>(0);
  const consult = useCallback(({type, value, inicio, fim}) => {
    // const { data: metricsData, isLoading: isLoading2, error: error2 } = useMetricsList({
    //   start_date: typeof inicio === 'string' ? inicio : inicio.toISOString().split('T')[0],
    //   end_date: typeof fim === 'string' ? fim : fim.toISOString().split('T')[0]
    // });
    metricsService.listMetrics({
      start_date: typeof inicio === 'string' ? inicio : inicio.toISOString().split('T')[0],
      end_date: typeof fim === 'string' ? fim : fim.toISOString().split('T')[0]
      }).then((res) => {
        // console.log("Métricas retornadas:", res);
        const resAny = res as any;
        const totalMetrics = resAny?.totais_filtrados || [];
        const totalTends = resAny?.agregados?.visitas?.por_semana || [];
        const totalTendsConv = resAny?.agregados?.conversas?.por_semana || [];
      // console.log(res);
      const totalPages = resAny?.last_page || 1;
      const registros = resAny?.registros ?? resAny?.data ?? [];
      // console.log(`registros:`,registros);      
      setMetrics(registros);
      setTotalPages(totalPages);      
    }).catch((error) => {
      console.error("Erro ao buscar métricas:", error);
      setError(error);
    });
    // // setIsLoading(isLoading2);
    // console.log(metricsData);
    // const resAny = metricsData as any;
    // Prioriza registros > data > []
  



    // console.log(`type: ${type}, value: ${value}, inicio: ${inicio}, fim: ${fim}`);
    
    setSelectedPeriod(type);
  }, []);
  
  const handleOpenModal = (metric?: MetricRecord) => {
    if (metric) {
      setEditingMetric(metric);
      // console.log('metric: ', metric);      
      form.reset(metric);
    } else {
      setEditingMetric(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMetric(null);
    form.reset();
  };

  const onSubmit = async (data: MetricFormData) => {
    try {
      if (editingMetric) {
        await updateMutation.mutateAsync({ 
          id: editingMetric.id, 
          data: data as CreateMetricInput 
        });
      } else {
        await createMutation.mutateAsync(data as CreateMetricInput);
      }
      handleCloseModal();
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  };

  const handleDelete = async () => {
    
    if (deletingMetric) {
      try {
        await deleteMutation.mutateAsync(deletingMetric.id);
        setDeletingMetric(null);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    const isLaravelTenancyError = (error as Error).message.includes('erro404_site') || 
                                 (error as Error).message.includes('View') || 
                                 (error as Error).message.includes('not found');
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-semibold text-destructive mb-2">Erro de Configuração</h2>
          {isLaravelTenancyError ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Erro de tenancy do Laravel. Configure a variável de ambiente:
              </p>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                VITE_TENANT_API_URL= {API_BASE_URL}
              </div>
              <p className="text-xs text-muted-foreground">
                Remova o prefixo "api-" do domínio para acessar o tenant correto.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Erro ao carregar {title1}: {(error as Error).message}
            </p>
          )}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title1}</h1>
          <p className="text-muted-foreground">
            Gerencie as {title1} do sistema
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova {title}
        </Button>
      </div>

      <Card>
        {/* <CardHeader>
          <CardTitle>Lista de {title1}</CardTitle>
          <CardDescription>
            {title2}
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={label1}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader> */}
         <PeriodSelector
            selectedPeriod={selectedPeriod}
            c_year={String(year)}
            onPeriodChange={consult}
         />
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Nenhuma {title} encontrada.</p>
              <Button 
                onClick={() => handleOpenModal()} 
                className="mt-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira {title}
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Investimento</TableHead>
                    <TableHead>Visitantes</TableHead>
                    <TableHead>Bot</TableHead>
                    <TableHead>Humanos</TableHead>
                    <TableHead>Propostas</TableHead>
                    <TableHead>Fechados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{dataParaBR(String(metric.period))}</TableCell>
                      <TableCell>R$ {metric.investment}</TableCell>
                      <TableCell>{metric.visitors}</TableCell>
                      <TableCell>{metric.bot_conversations}</TableCell>
                      <TableCell>{metric.human_conversations}</TableCell>
                      <TableCell>{metric.proposals}</TableCell>
                      <TableCell>{metric.closed_deals}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(metric)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingMetric(metric)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Editar '+title+'' : 'Nova '+title+''}
            </DialogTitle>
            <DialogDescription>
              {editingMetric 
                ? 'Atualize as informações da '+title+'.' 
                : 'Crie uma nova '+title+' no sistema.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="period" render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              {[
                { name: "investment", label: "Investimento", type: "number" },
                { name: "visitors", label: "Visitantes", type: "number" },
                { name: "bot_conversations", label: "Bot", type: "number" },
                { name: "human_conversations", label: "Humanos", type: "number" },
                { name: "proposals", label: "Propostas", type: "number" },
                { name: "closed_deals", label: "Fechados", type: "number" }
              ].map(({ name, label, type }) => (
                <FormField key={name} control={form.control} name={name as keyof MetricFormData} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type={type} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingMetric ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog 
        open={!!deletingMetric} 
        onOpenChange={() => setDeletingMetric(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o registro do dia "{dataParaBR(String(deletingMetric?.period))}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}