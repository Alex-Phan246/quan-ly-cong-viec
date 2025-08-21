export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

// Convenience wrappers
export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) => apiFetch('/auth/register', { method: 'POST', body: payload }),
  login: (payload: { email: string; password: string }) => apiFetch<{ token: string; user: any }>('/auth/login', { method: 'POST', body: payload }),
  me: () => apiFetch('/me', { auth: true }),

  // Products
  featured: () => apiFetch('/products/featured'),
  products: (query: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    return apiFetch(`/products?${params.toString()}`);
  },
  product: (id: number) => apiFetch(`/products/${id}`),

  // Cart
  getCart: () => apiFetch('/cart', { auth: true }),
  addToCart: (payload: { productId: number; quantity: number }) => apiFetch('/cart', { method: 'POST', body: payload, auth: true }),
  updateCartItem: (productId: number, quantity: number) => apiFetch(`/cart/${productId}`, { method: 'PUT', body: { quantity }, auth: true }),
  removeCartItem: (productId: number) => apiFetch(`/cart/${productId}`, { method: 'DELETE', auth: true }),

  // Orders
  checkout: (payload: { fullName: string; phone: string; address: string }) => apiFetch('/checkout', { method: 'POST', body: payload, auth: true }),
  myOrders: () => apiFetch('/orders', { auth: true }),
  order: (id: number) => apiFetch(`/orders/${id}`, { auth: true }),
};

