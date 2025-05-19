import axiosInstance from '../config/axios.config';
import { Branch, User } from '@/types';

// Interface untuk request dan response
export interface CreateBranchRequest {
  name: string;
  address: string;
  logo?: File;
  open_time: string;
  close_time: string;
  location: string;
  ownerId: number;
  admin_ids?: number[];
}

export interface UpdateBranchRequest {
  name?: string;
  location?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive';
}

export interface BranchListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
  q?: string;
}

export interface BranchListResponse {
  data: Branch[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  }

export interface BranchAdmin {
  userId: number;
  branchId: number;
  user: User;
}

class BranchApi {
  /**
   * Mendapatkan daftar cabang
   */
  async getBranches({ status }: { status?: string } = {}): Promise<{ data: Branch[] }> {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      
      const response = await axiosInstance.get<{ 
        data: Branch[], 
        status?: boolean,
        message?: string 
      }>('/branches', { params });
      
      // Handle different API response formats
      if (response.data) {
        // Format 1: { status: true, data: [...] }
        if ('status' in response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        } 
        // Format 2: { data: [...] }
        else if ('data' in response.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        } 
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return { data: response.data };
        }
      }
      
      // Fallback jika tidak ada data yang valid
      return { data: [] };
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw new Error('Failed to fetch branches');
    }
  }

  /**
   * Mendapatkan cabang yang dimiliki/dikelola oleh user yang login
   */
  async getUserBranches(): Promise<{ data: Branch[] }> {
    try {
      const response = await axiosInstance.get<{ data: Branch[], status?: boolean, message?: string }>('/branches/managed');
      // Handle different API response formats
      if (response.data) {
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        } else if (Array.isArray(response.data)) {
          return { data: response.data };
        }
      }
      return { data: [] };
    } catch (error) {
      console.error('Error fetching managed branches:', error);
      throw new Error('Failed to fetch managed branches');
    }
  }
  // Tambahkan di branch.api.ts
 async getUserManagedBranches(): Promise<{ data: Branch[] }> {
    try {
      const response = await axiosInstance.get<{ 
        data: Branch[], 
        status?: boolean, 
        message?: string 
      }>('/branches/managed');
      
      // Handle different API response formats
      if (response.data) {
        // Format 1: { status: true, data: [...] }
        if ('status' in response.data && 'data' in response.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        } 
        // Format 2: { data: [...] }
        else if ('data' in response.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        } 
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return { data: response.data };
        }
      }
      
      // Fallback jika tidak ada data yang valid
      return { data: [] };
    } catch (error) {
      console.error('Error fetching managed branches:', error);
      throw new Error('Failed to fetch managed branches');
    }
  }
  /**
   * Mendapatkan detail cabang berdasarkan ID
   */
  async getBranchById(id: number): Promise<Branch> {
    const response = await axiosInstance.get<Branch>(`/branches/${id}`);
    return response.data;
  }

  /**
   * Membuat cabang baru
   */
  async createBranch(data: CreateBranchRequest): Promise<Branch> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('open_time', data.open_time);
    formData.append('close_time', data.close_time);
    formData.append('location', data.location);
    formData.append('ownerId', data.ownerId.toString());
    
    if (data.logo) {
      formData.append('logo', data.logo);
    }
    
    if (data.admin_ids && data.admin_ids.length > 0) {
      data.admin_ids.forEach(id => {
        formData.append('admin_ids', id.toString());
      });
    }

    const response = await axiosInstance.post<Branch>('/branches', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Mengupdate cabang
   */
  async updateBranch(id: number, data: UpdateBranchRequest): Promise<Branch> {
    const response = await axiosInstance.put<Branch>(`/branches/${id}`, data);
    return response.data;
  }

  /**
   * Menghapus cabang
   */
  async deleteBranch(id: number): Promise<void> {
    await axiosInstance.delete(`/branches/${id}`);
  }

  /**
   * Mendapatkan daftar admin cabang
   */
  async getBranchAdmins(branchId: number): Promise<BranchAdmin[]> {
    const response = await axiosInstance.get<BranchAdmin[]>(`/branches/${branchId}/admins`);
    return response.data;
  }

  /**
   * Menambah admin cabang
   */
  async addBranchAdmin(branchId: number, userId: number): Promise<void> {
    await axiosInstance.post(`/branches/${branchId}/admins`, { userId });
  }

  /**
   * Menghapus admin cabang
   */
  async removeBranchAdmin(branchId: number, userId: number): Promise<void> {
    await axiosInstance.delete(`/branches/${branchId}/admins/${userId}`);
  }

  /**
   * Upload gambar cabang
   */
  async uploadBranchImage(branchId: number, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post<{ imageUrl: string }>(
      `/branches/${branchId}/image`,
      formData,
      {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      }
    );
    
    return response.data;
  }
}

export const branchApi = new BranchApi(); 