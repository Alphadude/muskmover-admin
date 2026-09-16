const configuredUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // If browser is running over HTTPS, plain HTTP requests are blocked as Mixed Content.
    // Use relative path ('') so requests are routed through Next.js reverse proxy rewrites.
    if (window.location.protocol === 'https:' && (!configuredUrl || configuredUrl.startsWith('http://'))) {
      return '';
    }
  }
  return configuredUrl || 'http://206.189.238.173:80';
}

export const BASE_URL = configuredUrl || 'http://206.189.238.173:80';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (typeof errorData.message === 'string' && errorData.message.trim() ? errorData.message.trim() : null) ||
      (typeof errorData.error === 'string' && errorData.error !== 'An error occurred' && errorData.error.trim() ? errorData.error.trim() : null) ||
      errorData.error ||
      response.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, data: any) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(path: string, data: any) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
