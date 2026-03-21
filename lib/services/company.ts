import { api } from '../api-client';
import { MarineCompany } from '../types';

export const companyService = {
  async getAll(): Promise<MarineCompany[]> {
    return api.get<MarineCompany[]>('/api/companies');
  },

  async getById(id: string): Promise<MarineCompany> {
    return api.get<MarineCompany>(`/api/companies/${id}`);
  },

  async create(data: Partial<MarineCompany>): Promise<MarineCompany> {
    return api.post<MarineCompany>('/api/companies', data);
  },

  async uploadImage(payload: { data: string; type: string }): Promise<any> {
    return api.post<any>('/api/uploads', payload);
  },

  async update(id: string, data: Partial<MarineCompany>): Promise<MarineCompany> {
    return api.put<MarineCompany>(`/api/companies/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/api/companies/${id}`);
  },
};
