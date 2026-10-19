import { configureStore, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from './types';

export type Filters = {
  search: string; category: string; payment: string; dateFrom: string; dateTo: string;
  minAmount: string; maxAmount: string; sort: 'date' | 'amount'; direction: 'asc' | 'desc';
};
const initialState: Filters = { search: '', category: 'all', payment: 'all', dateFrom: '', dateTo: '',
  minAmount: '', maxAmount: '', sort: 'date', direction: 'desc' };
const filtersSlice = createSlice({ name: 'filters', initialState, reducers: {
  setFilters: (state, action: PayloadAction<Partial<Filters>>) => Object.assign(state, action.payload),
  reset: () => initialState
}});
const expensesSlice = createSlice({ name: 'expenses', initialState: [] as Expense[], reducers: {
  setExpenses: (_state, action: PayloadAction<Expense[]>) => action.payload
}});
export const { setFilters, reset } = filtersSlice.actions;
export const { setExpenses } = expensesSlice.actions;
export const store = configureStore({ reducer: { filters: filtersSlice.reducer, expenses: expensesSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;

// All expense-list searching, filtering and ordering lives in Redux, not in page components.
export const selectFilteredExpenses = createSelector(
  [(state: RootState) => state.expenses, (state: RootState) => state.filters],
  (expenses, f) => expenses.filter(expense =>
    expense.title.toLowerCase().includes(f.search.trim().toLowerCase()) &&
    (f.category === 'all' || expense.categoryId === f.category) &&
    (f.payment === 'all' || expense.paymentMethod === f.payment) &&
    (!f.dateFrom || expense.date >= f.dateFrom) && (!f.dateTo || expense.date <= f.dateTo) &&
    (f.minAmount === '' || expense.amount >= Number(f.minAmount)) &&
    (f.maxAmount === '' || expense.amount <= Number(f.maxAmount))
  ).sort((a, b) => {
    const difference = f.sort === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date);
    return difference ? difference * (f.direction === 'asc' ? 1 : -1) : a.id.localeCompare(b.id);
  })
);
