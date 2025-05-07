export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  imageUrl?: string | null;
  ownerId: number;
  status: BranchStatus;
  createdAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BranchAdmin {
  branchId: number;
  userId: number;
} 