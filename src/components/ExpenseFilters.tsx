import { useDispatch, useSelector } from 'react-redux';
import { Category } from '../types';
import { RootState, reset, setFilters } from '../store';
export function ExpenseFilters({ categories }: { categories: Category[] }) {
  const dispatch = useDispatch(), f = useSelector((state: RootState) => state.filters);
  return <div className="filters">
    <input aria-label="Search expenses" placeholder="Search expenses" value={f.search} onChange={e => dispatch(setFilters({ search: e.target.value }))} />
    <select aria-label="Filter category" value={f.category} onChange={e => dispatch(setFilters({ category: e.target.value }))}>
      <option value="all">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <select aria-label="Filter payment method" value={f.payment} onChange={e => dispatch(setFilters({ payment: e.target.value }))}>
      <option value="all">All payment methods</option><option>Card</option><option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option></select>
    <label>From<input type="date" value={f.dateFrom} onChange={e => dispatch(setFilters({ dateFrom: e.target.value }))} /></label>
    <label>To<input type="date" value={f.dateTo} onChange={e => dispatch(setFilters({ dateTo: e.target.value }))} /></label>
    <label>Minimum amount<input type="number" min="0" step="0.01" value={f.minAmount} onChange={e => dispatch(setFilters({ minAmount: e.target.value }))} /></label>
    <label>Maximum amount<input type="number" min="0" step="0.01" value={f.maxAmount} onChange={e => dispatch(setFilters({ maxAmount: e.target.value }))} /></label>
    <select aria-label="Sort expenses" value={f.sort} onChange={e => dispatch(setFilters({ sort: e.target.value as 'date' | 'amount' }))}>
      <option value="date">Sort by date</option><option value="amount">Sort by amount</option></select>
    <button type="button" className="secondary" onClick={() => dispatch(setFilters({ direction: f.direction === 'asc' ? 'desc' : 'asc' }))}>
      {f.direction === 'asc' ? '↑ Ascending' : '↓ Descending'}</button>
    <button type="button" className="secondary" onClick={() => dispatch(reset())}>Reset filters</button>
  </div>;
}
