const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Não foi possível se comunicar com a API. Confira se o backend está ativo.');
  }

  if (response.status === 204) return null;
  let result = {};
  let invalidJson = false;
  try { result = await response.json(); } catch {
    invalidJson = true;
    if (response.ok) return null;
  }
  if (!response.ok) {
    const detailMessage = result.details?.map((detail) => detail.message).join(' ');
    const message = detailMessage || result.error || (invalidJson && response.status >= 500
      ? 'Não foi possível se comunicar com a API. Confira se o backend está ativo.'
      : 'Ocorreu um erro ao processar sua solicitação.');
    throw new ApiError(message, response.status, result.details || []);
  }
  return result;
}

export const authApi = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: (token) => apiRequest('/auth/me', { token }),
};

export const taskApi = {
  list: (token) => apiRequest('/tasks', { token }),
  create: (token, data) => apiRequest('/tasks', { token, method: 'POST', body: JSON.stringify(data) }),
  update: (token, id, data) => apiRequest(`/tasks/${id}`, { token, method: 'PATCH', body: JSON.stringify(data) }),
  remove: (token, id) => apiRequest(`/tasks/${id}`, { token, method: 'DELETE' }),
};