export enum FieldStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

export interface FieldType {
  id: number;
  name: string;
}

export interface Field {
  id: number;
  branchId: number;
  typeId: number;
  type: FieldType;
  name: string;
  priceDay: number;
  priceNight: number;
  status: FieldStatus;
  imageUrl?: string;
  createdAt: string;
}

export interface FieldReview {
  id: number;
  userId: number;
  fieldId: number;
  rating: number;
  review?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
  field: {
    id: number;
    name: string;
    branch: {
      id: number;
      name: string;
    };
  };
} 