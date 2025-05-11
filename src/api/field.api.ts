import axiosInstance from '../config/axios.config';
import { Field, FieldReview, FieldType } from '../types';

// Interface untuk format respons dengan data dan meta
interface FieldResponseWithMeta {
  data: Field[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

class FieldApi {
  /**
   * Dapatkan semua lapangan
   * @returns Promise dengan array data lapangan
   */
  async getAllFields(): Promise<FieldResponseWithMeta> {
    const response = await axiosInstance.get<FieldResponseWithMeta>('/fields');
    return response.data;
  }

  /**
   * Dapatkan lapangan berdasarkan ID
   * @param id - ID lapangan
   * @returns Promise dengan data lapangan
   */
  async getFieldById(id: number): Promise<Field> {
    try {
      const response = await axiosInstance.get<
        { data: Field } | 
        { field: Field } | 
        Field | 
        { status: boolean; message: string; data: { field: Field } }
      >(`/fields/${id}`);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: {...} } (bukan format { status, message, data })
        if ('data' in response.data && !('status' in response.data) && !('message' in response.data)) {
          return response.data.data;
        }
        // Format 2: { field: {...} }
        else if ('field' in response.data && !('data' in response.data)) {
          return response.data.field;
        }
        // Format 3: Objek field langsung
        else if ('id' in response.data && 'name' in response.data) {
          return response.data as Field;
        }
        // Format 4: { status, message, data: { field } } - Format API baru
        else if ('status' in response.data && 'message' in response.data && 'data' in response.data) {
          if (response.data.data && typeof response.data.data === 'object' && 'field' in response.data.data) {
            return response.data.data.field as Field;
          }
        }
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error fetching field with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Dapatkan lapangan berdasarkan ID cabang
   * @param branchId - ID cabang
   * @returns Promise dengan array data lapangan
   */
  async getFieldsByBranchId(branchId: number): Promise<Field[]> {
    try {
      const response = await axiosInstance.get<FieldResponseWithMeta | { fields: Field[] } | Field[]>(`/branches/${branchId}/fields`);
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { fields: [...] }
        else if ('fields' in response.data && Array.isArray(response.data.fields)) {
          return response.data.fields;
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
      console.error(`Error fetching fields for branch ID ${branchId}:`, error);
      return [];
    }
  }

  /**
   * Dapatkan semua tipe lapangan
   * @returns Promise dengan array tipe lapangan
   */
  async getFieldTypes(): Promise<FieldType[]> {
    try {
      const response = await axiosInstance.get<{ data: FieldType[] } | { fieldTypes: FieldType[] } | FieldType[]>('/field-types');
      
      // Handle format respons yang berbeda-beda
      if (response.data && typeof response.data === 'object') {
        // Format 1: { data: [...], meta: {...} }
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // Format 2: { fieldTypes: [...] }
        else if ('fieldTypes' in response.data && Array.isArray(response.data.fieldTypes)) {
          return response.data.fieldTypes;
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
      console.error('Error fetching field types:', error);
      return [];
    }
  }

  /**
   * Buat lapangan baru
   * @param data - Data lapangan baru
   * @returns Promise dengan data lapangan yang berhasil dibuat
   */
  async createField(data: Omit<Field, 'id' | 'createdAt'>): Promise<Field> {
    const response = await axiosInstance.post<{ field: Field }>('/fields', data);
    return response.data.field;
  }

  /**
   * Update data lapangan
   * @param id - ID lapangan
   * @param data - Data lapangan yang akan diupdate
   * @returns Promise dengan data lapangan yang berhasil diupdate
   */
  async updateField(id: number, data: Partial<Omit<Field, 'id' | 'createdAt'>>): Promise<Field> {
    const response = await axiosInstance.put<{ field: Field }>(`/fields/${id}`, data);
    return response.data.field;
  }

  /**
   * Hapus lapangan
   * @param id - ID lapangan
   * @returns Promise dengan pesan sukses
   */
  async deleteField(id: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete<{ message: string }>(`/fields/${id}`);
    return response.data;
  }

  /**
   * Upload gambar untuk lapangan
   * @param id - ID lapangan
   * @param image - File gambar
   * @returns Promise dengan URL gambar yang berhasil diupload
   */
  async uploadFieldImage(id: number, image: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axiosInstance.post<{ imageUrl: string }>(`/fields/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Dapatkan review lapangan
   * @param fieldId - ID lapangan
   * @returns Promise dengan array data review
   */
  async getFieldReviews(fieldId: number): Promise<FieldReview[]> {
    const response = await axiosInstance.get<{ reviews: FieldReview[] }>(`/fields/${fieldId}/reviews`);
    return response.data.reviews;
  }

  /**
   * Buat review lapangan
   * @param fieldId - ID lapangan
   * @param data - Data review baru
   * @returns Promise dengan data review yang berhasil dibuat
   */
  async createFieldReview(
    fieldId: number,
    data: { rating: number; review?: string }
  ): Promise<FieldReview> {
    const response = await axiosInstance.post<{ review: FieldReview }>(`/fields/${fieldId}/reviews`, data);
    return response.data.review;
  }

  /**
   * Cek ketersediaan lapangan
   * @param fieldId - ID lapangan
   * @param date - Tanggal booking
   * @returns Promise dengan data slot waktu tersedia
   */
  async checkFieldAvailability(fieldId: number, date: string): Promise<{ slots: { time: string, available: boolean }[] }> {
    try {
      const response = await axiosInstance.get<{ data: { slots: { time: string, available: boolean }[] } } | { slots: { time: string, available: boolean }[] }>(`/fields/${fieldId}/availability?date=${date}`);
      
      // Format 1: { data: { slots: [...] } }
      if ('data' in response.data && response.data.data.slots) {
        return { slots: response.data.data.slots };
      }
      // Format 2: { slots: [...] }
      else if ('slots' in response.data) {
        return { slots: response.data.slots };
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error(`Error checking field availability for field ID ${fieldId}:`, error);
      return { slots: [] };
    }
  }
}

export const fieldApi = new FieldApi(); 