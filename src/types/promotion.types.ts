export enum PromotionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled'
}

export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discountPercent: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  status: PromotionStatus;
  createdAt: string;
}

export interface PromotionUsage {
  id: number;
  userId: number;
  bookingId: number;
  promoId: number;
  createdAt: string;
} 