import { api } from '../api-client';
import { AdminUser } from '../types';

export const userService = {
  async getAll(): Promise<AdminUser[]> {
    return api.get<AdminUser[]>('/api/admins');
  },

  async getById(id: string): Promise<AdminUser> {
    return api.get<AdminUser>(`/api/admins/${id}`);
  },

  async create(data: Partial<AdminUser>): Promise<AdminUser> {
    return api.post<AdminUser>('/api/admins', data);
  },

  async update(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return api.put<AdminUser>(`/api/admins/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/api/admins/${id}`);
  },
};
