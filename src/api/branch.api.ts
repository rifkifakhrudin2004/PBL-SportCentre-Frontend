import axiosInstance from './axios.config';
import { Branch } from '../types';

// Interface untuk format respons dengan data dan meta
interface BranchResponseWithMeta {
  data: Branch[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

class BranchApi {
  /**
   * Dapatkan semua cabang
   * @returns Promise dengan array data cabang
   */
  async getAllBranches(): Promise<Branch[]> {
    try {
      const response = await axiosInstance.get<BranchResponseWithMeta | { branches: Branch[] } | Branch[]>('/branches');
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { branches: [...] }
        else if ('branches' in response.data && Array.isArray(response.data.branches)) {
          return response.data.branches;
        }
        // Format 3: Array langsung [...]
        else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Jika format tidak dikenali, kembalikan array kosong
      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  }

  /**
   * Dapatkan cabang berdasarkan ID
   * @param id - ID cabang
   * @returns Promise dengan data cabang
   */
  async getBranchById(id: number): Promise<Branch> {
    try {
      const response = await axiosInstance.get<
        { data: Branch } | 
        { branch: Branch } | 
        Branch | 
        { status: boolean; message: string; data: { branch: Branch } }
      >(`/branches/${id}`);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: {...} } (bukan format { status, message, data })
        if ('data' in response.data && !('status' in response.data) && !('message' in response.data)) {
          return response.data.data;
        }
        // Format 2: { branch: {...} }
        else if ('branch' in response.data && !('data' in response.data)) {
          return response.data.branch;
        }
        // Format 3: Objek branch langsung
        else if ('id' in response.data && 'name' in response.data) {
          return response.data as Branch;
        }
        // Format 4: { status, message, data: { branch } } - Format API baru
        else if ('status' in response.data && 'message' in response.data && 'data' in response.data) {
          if (response.data.data && typeof response.data.data === 'object' && 'branch' in response.data.data) {
            return response.data.data.branch as Branch;
          }
        }
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buat cabang baru
   * @param data - Data cabang baru
   * @returns Promise dengan data cabang yang berhasil dibuat
   */
  async createBranch(data: Omit<Branch, 'id' | 'createdAt'>): Promise<Branch> {
    const response = await axiosInstance.post<{ branch: Branch } | { data: Branch }>('/branches', data);
    
    // Format 1: { data: {...} }
    if ('data' in response.data) {
      return response.data.data;
    }
    // Format 2: { branch: {...} }
    return response.data.branch;
  }

  /**
   * Update data cabang
   * @param id - ID cabang
   * @param data - Data cabang yang akan diupdate
   * @returns Promise dengan data cabang yang berhasil diupdate
   */
  async updateBranch(id: number, data: Partial<Omit<Branch, 'id' | 'createdAt'>>): Promise<Branch> {
    const response = await axiosInstance.put<{ branch: Branch } | { data: Branch }>(`/branches/${id}`, data);
    
    // Format 1: { data: {...} }
    if ('data' in response.data) {
      return response.data.data;
    }
    // Format 2: { branch: {...} }
    return response.data.branch;
  }

  /**
   * Hapus cabang
   * @param id - ID cabang
   * @returns Promise dengan pesan sukses
   */
  async deleteBranch(id: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/branches/${id}`);
    return response.data;
  }

  /**
   * Upload gambar untuk cabang
   * @param id - ID cabang
   * @param image - File gambar
   * @returns Promise dengan URL gambar yang berhasil diupload
   */
  async uploadBranchImage(id: number, image: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axiosInstance.post<{ imageUrl: string } | { data: { imageUrl: string } }>(`/branches/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Format 1: { data: { imageUrl: ... } }
    if ('data' in response.data && typeof response.data.data === 'object' && 'imageUrl' in response.data.data) {
      return { imageUrl: response.data.data.imageUrl };
    }
    // Format 2: { imageUrl: ... }
    return response.data as { imageUrl: string };
  }
}

export const branchApi = new BranchApi(); 