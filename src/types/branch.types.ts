export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  imageUrl?: string;
  ownerId: number;
  status: BranchStatus;
  createdAt: string;
}

export interface BranchAdmin {
  branchId: number;
  userId: number;
} 