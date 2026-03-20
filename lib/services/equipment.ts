import { api } from '../api-client';
import { Equipment } from '../types';

export const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    return api.get<Equipment[]>('/api/equipment');
  },

  async getById(id: string): Promise<Equipment> {
    return api.get<Equipment>(`/api/equipment/${id}`);
  },

  async getCategories(): Promise<string[]> {
    return api.get<string[]>('/api/equipment/categories');
  },

  async getByCompanyId(companyId: string): Promise<Equipment[]> {
    return api.get<Equipment[]>(`/api/companies/${companyId}/equipment`);
  },

  async create(data: Partial<Equipment>): Promise<Equipment> {
    return api.post<Equipment>('/api/equipment', data);
  },

  async update(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return api.put<Equipment>(`/api/equipment/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/api/equipment/${id}`);
  },
};
