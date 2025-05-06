export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN_CABANG = 'admin_cabang',
  OWNER_CABANG = 'owner_cabang',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface UserWithToken {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
} 