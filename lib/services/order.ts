import { api } from '../api-client';
import { Order } from '../types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    return api.get<Order[]>('/api/orders');
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/api/orders/${id}`);
  },

  async getByCompanyId(companyId: string): Promise<Order[]> {
    return api.get<Order[]>(`/api/companies/${companyId}/orders`);
  },

  async getByEquipmentId(equipmentId: string): Promise<Order[]> {
    return api.get<Order[]>(`/api/equipment/${equipmentId}/orders`);
  },

  async create(data: Partial<Order>): Promise<Order> {
    return api.post<Order>('/api/orders', data);
  },

  async update(id: string, data: Partial<Order>): Promise<Order> {
    return api.put<Order>(`/api/orders/${id}`, data);
  },
};
