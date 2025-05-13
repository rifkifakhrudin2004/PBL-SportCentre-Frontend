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
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
    phone?: string;
  };
  branch?: {
    id: number;
    name: string;
    location: string;
  };
}

export interface BranchAdminView {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  status: 'active' | 'inactive';
  role: string;
  lastActive: string;
}

export interface BranchView {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  adminCount: number;
  fieldCount: number;
} 