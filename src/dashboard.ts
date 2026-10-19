import { Expense } from './types';
export function summarizeMonth(expenses: Expense[], month: string, budget: number) {
  const monthly = expenses.filter(expense => expense.date.startsWith(month));
  const spent = monthly.reduce((sum, expense) => sum + Math.round(expense.amount * 100), 0) / 100;
  const highest = monthly.reduce<Expense | undefined>((current, expense) =>
    !current || expense.amount > current.amount ? expense : current, undefined);
  const categoryTotals = monthly.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.categoryId] = (totals[expense.categoryId] || 0) + Math.round(expense.amount * 100);
    return totals;
  }, {});
  const status = budget === 0 ? 'No budget set' : spent > budget ? 'Over budget' :
    spent >= budget * .8 ? 'Approaching limit' : 'Within budget';
  return { spent, remaining: Math.round((budget - spent) * 100) / 100, highest, categoryTotals, status,
    recent: [...monthly].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5) };
}
