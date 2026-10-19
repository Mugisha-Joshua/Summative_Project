import { Budget, Category, Expense, User, Insights } from './types';
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const getToken = () => localStorage.getItem('retain_token');
export const setToken = (value: string | null) => {
  if (value) localStorage.setItem('retain_token', value);
  else localStorage.removeItem('retain_token');
};
async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers: {
      'Content-Type': 'application/json', ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}), ...options.headers
    } });
  } catch {
    throw new Error('Cannot reach the API. Check your connection and try again; the free server may be waking up.');
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'The server could not complete your request. Please try again.');
  if (data === null) throw new Error('The API returned an unexpected response. Check the deployment API URL.');
  return data as T;
}
export type ExpenseQuery = { page?: number; limit?: number; search?: string; category?: string;
  paymentMethod?: string; dateFrom?: string; dateTo?: string; minAmount?: number; maxAmount?: number;
  sort?: 'date' | 'amount'; direction?: 'asc' | 'desc' };
type ExpensePage = { data: Expense[]; total: number; page: number; pages: number };
function expenses(query: ExpenseQuery = {}) {
  const params = new URLSearchParams(Object.entries(query).filter(([, value]) =>
    value !== undefined && value !== '' && value !== 'all').map(([key, value]) => [key, String(value)]));
  return call<ExpensePage>('/expenses?' + params);
}
async function allExpenses() {
  const first = await expenses({ limit: 50 });
  const data = [...first.data];
  for (let page = 2; page <= first.pages; page++) data.push(...(await expenses({ limit: 50, page })).data);
  return [...new Map(data.map(expense => [expense.id, expense])).values()];
}
export const api = {
  me: () => call<User>('/auth/me'),
  signup: (data: object) => call<{ token: string; user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  signin: (data: object) => call<{ token: string; user: User }>('/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
  categories: () => call<Category[]>('/categories'), expenses, allExpenses,
  saveExpense: (data: Partial<Expense>) => call<Expense>(data.id ? '/expenses/' + data.id : '/expenses', { method: data.id ? 'PUT' : 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => call<void>('/expenses/' + id, { method: 'DELETE' }),
  budget: (month: string) => call<Budget>('/budgets/' + month),
  saveBudget: (month: string, amount: number) => call<Budget>('/budgets/' + month, { method: 'PUT', body: JSON.stringify({ amount }) }),
  insights: () => call<Insights>('/admin/insights'),
  createCategory: (data: object) => call<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: object) => call<Category>('/categories/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => call<void>('/categories/' + id, { method: 'DELETE' })
};
