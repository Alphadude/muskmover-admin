import { api } from '../api-client';

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: any): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/auth/login', credentials);
  },

  async getMe(): Promise<LoginResponse['admin']> {
    return api.get<LoginResponse['admin']>('/api/auth/me');
  },
};
