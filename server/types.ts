export type Role = 'user' | 'admin';
export interface User { id: string; name: string; email: string; passwordHash: string; role: Role; createdAt: string; }
export interface Category { id: string; name: string; color: string; createdAt: string; }
export interface Expense { id: string; userId: string; title: string; amount: number; categoryId: string; date: string; paymentMethod: string; notes?: string; createdAt: string; }
export interface Budget { id: string; userId: string; month: string; amount: number; }
export interface Database { users: User[]; categories: Category[]; expenses: Expense[]; budgets: Budget[]; }
