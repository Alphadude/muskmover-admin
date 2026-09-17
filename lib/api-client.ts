export const DEFAULT_API_URL = 'https://api.muskmover.ng';

function normalizeApiUrl(url?: string): string {
  if (!url) return DEFAULT_API_URL;
  const cleaned = url
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api-docs\/?$/, '');

  // If set to relative path, the admin frontend domain itself, or an outdated raw IP / HTTP address
  if (
    !cleaned ||
    cleaned === '/' ||
    cleaned === '/api' ||
    cleaned.includes('admin.muskmover.ng') ||
    cleaned.includes('206.189.238.173') ||
    cleaned.startsWith('http://api.muskmover.ng')
  ) {
    return DEFAULT_API_URL;
  }

  return cleaned;
}

const configuredUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // If the browser is on an HTTPS page (like https://admin.muskmover.ng)
    // ensure we don't use an insecure HTTP endpoint
    if (window.location.protocol === 'https:' && configuredUrl.startsWith('http://')) {
      if (configuredUrl.includes('muskmover.ng') || configuredUrl.includes('206.189.238.173')) {
        return DEFAULT_API_URL;
      }
    }
  }
  return configuredUrl || DEFAULT_API_URL;
}

export const BASE_URL = configuredUrl || DEFAULT_API_URL;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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
  const fullUrl = `${baseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    throw new ApiError(
      `Network error: Unable to reach backend server at ${baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'api')}. Please check your connection.`,
      0
    );
  }

  if (!response.ok) {
    let errorData: any = {};
    let rawText = '';
    try {
      rawText = await response.text();
      if (rawText) {
        errorData = JSON.parse(rawText);
      }
    } catch {
      // Body is not JSON (e.g. HTML 500/502/504 error page from Cloudflare/Nginx/Express)
    }

    let extractedMessage =
      (typeof errorData.message === 'string' && errorData.message.trim() ? errorData.message.trim() : null) ||
      (typeof errorData.error === 'string' && errorData.error !== 'An error occurred' && errorData.error.trim() ? errorData.error.trim() : null);

    // If still no message and we have raw text, see if there's an HTML title or clean text
    if (!extractedMessage && rawText) {
      const titleMatch = rawText.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        extractedMessage = titleMatch[1].trim();
      } else if (rawText.length < 200 && !rawText.includes('<html')) {
        extractedMessage = rawText.trim();
      }
    }

    let statusMessage = '';
    switch (response.status) {
      case 400:
        statusMessage = 'Bad request (400): The server could not process the request.';
        break;
      case 401:
        statusMessage = 'Session expired or unauthorized (401). Please log in again.';
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('authToken');
        }
        break;
      case 403:
        statusMessage = 'Access denied (403): You do not have permission to access this resource.';
        break;
      case 404:
        statusMessage = `Resource not found (404): ${path}`;
        break;
      case 500:
        statusMessage = 'Internal server error (500): The database or backend server encountered an error.';
        break;
      case 502:
        statusMessage = 'Bad gateway (502): The backend server is currently unreachable.';
        break;
      case 503:
        statusMessage = 'Service unavailable (503): The server is temporarily overloaded or down.';
        break;
      case 504:
        statusMessage = 'Gateway timeout (504): The server took too long to respond (possible database connection timeout).';
        break;
      default:
        if (response.status >= 520 && response.status <= 524) {
          statusMessage = `Cloudflare error (${response.status}): Web server connection failed or timed out.`;
        } else if (response.statusText) {
          statusMessage = `${response.statusText} (${response.status})`;
        } else {
          statusMessage = `Request failed with status ${response.status}`;
        }
    }

    const finalMessage = extractedMessage ? `${extractedMessage} (${response.status})` : statusMessage;
    throw new ApiError(finalMessage, response.status, errorData);
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
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
