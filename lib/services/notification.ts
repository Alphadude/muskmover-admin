import { api } from '../api-client';
import { Message } from '../types';

export const notificationService = {
  async getAll(): Promise<Message[]> {
    return api.get<Message[]>('/api/notifications');
  },

  async markAsRead(id: string): Promise<void> {
    return api.put(`/api/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    return api.put('/api/notifications/read-all', {});
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/api/notifications/${id}`);
  },

  async deleteAll(): Promise<void> {
    return api.delete('/api/notifications');
  }
};
