export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function getAuthHeader() {
  const token = sessionStorage.getItem('auth_token');
  return token ? { 'Authorization': `Basic ${token}` } : {};
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('unauthorized'));
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}
