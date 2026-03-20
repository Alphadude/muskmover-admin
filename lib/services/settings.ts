import { api } from '../api-client';
import { PlatformSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<PlatformSettings> {
    return api.get<PlatformSettings>('/api/settings');
  },

  async updateSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return api.put<PlatformSettings>('/api/settings', data);
  }
};
