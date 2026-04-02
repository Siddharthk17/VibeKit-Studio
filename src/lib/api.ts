const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ user: { id: string; email: string }; token: string }>('/auth-signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string }; token: string }>('/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getPages: () =>
    request<{ pages: any[] }>('/pages'),

  createPage: (title?: string, themeId?: string) =>
    request<{ page: any }>('/pages', {
      method: 'POST',
      body: JSON.stringify({ title, theme_id: themeId }),
    }),

  getPage: (id: string) =>
    request<{ page: any }>(`/pages/${id}`),

  updatePage: (id: string, data: { title?: string; theme_id?: string; content?: any; slug?: string }) =>
    request<{ page: any }>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  publishPage: (id: string) =>
    request<{ page: any }>(`/pages/${id}/publish`, { method: 'POST' }),

  unpublishPage: (id: string) =>
    request<{ page: any }>(`/pages/${id}/unpublish`, { method: 'POST' }),

  duplicatePage: (id: string) =>
    request<{ page: any }>(`/pages/${id}/duplicate`, { method: 'POST' }),

  getPublicPage: (slug: string) =>
    request<{ page: any }>(`/public/pages/${slug}`),

  trackView: (slug: string) =>
    request<{ success: boolean }>(`/public/pages/${slug}/view`, { method: 'POST' }),

  submitContact: (slug: string, data: { name: string; email: string; message: string }) =>
    request<{ submission: any }>(`/public/pages/${slug}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
