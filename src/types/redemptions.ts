/**
 * Tipos relacionados a resgates de pontos e extratos
 */

// Status possíveis para um resgate
export type RedemptionStatus = 
  | 'pending'      // Aguardando processamento
  | 'processing'   // Em processamento
  | 'confirmed'    // Confirmado
  | 'shipped'      // Enviado
  | 'delivered'    // Entregue
  | 'cancelled'    // Cancelado
  | 'refunded';    // Reembolsado

// Prioridades para processamento
export type RedemptionPriority = 'low' | 'medium' | 'high' | 'urgent';

// Interface para resgate de produto
export interface Redemption {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  pointsUsed: number;
  redemptionDate: string;
  status: RedemptionStatus;
  priority?: RedemptionPriority;
  trackingCode?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo para movimentação de pontos
export type PointsTransactionType = 
  | 'earned'       // Pontos ganhos
  | 'redeemed'     // Pontos resgatados
  | 'expired'      // Pontos expirados
  | 'bonus'        // Bônus
  | 'refund'       // Reembolso
  | 'adjustment';  // Ajuste manual

// Interface para extrato de pontos
export interface PointsExtract {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: PointsTransactionType;
  points: number;
  description: string;
  reference?: string;  // ID de referência (ex: ID do resgate)
  balanceBefore: number;
  balanceAfter: number;
  expirationDate?: string;
  createdAt: string;
  createdBy?: string;  // ID do usuário que criou (para ajustes manuais)
}

// Interface para filtros de resgates
export interface RedemptionFilters {
  status?: RedemptionStatus;
  priority?: RedemptionPriority;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

// Interface para filtros de extratos
export interface PointsExtractFilters {
  type?: PointsTransactionType;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

// Interface para estatísticas de resgates
export interface RedemptionStats {
  total: number;
  pending: number;
  processing: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalPointsUsed: number;
}

// Interface para estatísticas de pontos
export interface PointsStats {
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  activeUsers: number;
  averageBalance: number;
}

// Constantes para status
export const REDEMPTION_STATUSES = {
  pending: { label: 'Pendente', color: 'yellow' },
  processing: { label: 'Processando', color: 'blue' },
  confirmed: { label: 'Confirmado', color: 'green' },
  shipped: { label: 'Enviado', color: 'purple' },
  delivered: { label: 'Entregue', color: 'green' },
  cancelled: { label: 'Cancelado', color: 'red' },
  refunded: { label: 'Reembolsado', color: 'orange' }
} as const;

// Constantes para tipos de transação
export const POINTS_TRANSACTION_TYPES = {
  earned: { label: 'Ganhos', color: 'green' },
  redeemed: { label: 'Resgatados', color: 'blue' },
  expired: { label: 'Expirados', color: 'red' },
  bonus: { label: 'Bônus', color: 'purple' },
  refund: { label: 'Reembolso', color: 'orange' },
  adjustment: { label: 'Ajuste', color: 'gray' }
} as const;

// Constantes para prioridades
export const REDEMPTION_PRIORITIES = {
  low: { label: 'Baixa', color: 'gray' },
  medium: { label: 'Média', color: 'yellow' },
  high: { label: 'Alta', color: 'orange' },
  urgent: { label: 'Urgente', color: 'red' }
} as const;