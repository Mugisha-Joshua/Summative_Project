import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { Category, Expense } from '../types';
import { RootState, selectFilteredExpenses, setExpenses } from '../store';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { ExpenseDetails } from '../components/ExpenseDetails';
import { ExpenseList } from '../components/ExpenseList';

export function Expenses() {
  const dispatch = useDispatch(), filtered = useSelector(selectFilteredExpenses);
  const filters = useSelector((state: RootState) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Expense>(), [detail, setDetail] = useState<Expense>();
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const [page, setPage] = useState(1), [loading, setLoading] = useState(true);
  const pages = Math.max(1, Math.ceil(filtered.length / 8)), currentPage = Math.min(page, pages);
  const items = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  useEffect(() => { setPage(1); }, [filters]);
  useEffect(() => {
    let active = true;
    dispatch(setExpenses([]));
    Promise.all([api.allExpenses(), api.categories()])
      .then(([items, cats]) => { if (active) { dispatch(setExpenses(items)); setCategories(cats); } })
      .catch(reason => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dispatch]);
  async function reload() { dispatch(setExpenses(await api.allExpenses())); }
  async function save(expense: Partial<Expense>) {
    await api.saveExpense(expense);
    setEditing(undefined); setPage(1); setMessage(expense.id ? 'Expense updated.' : 'Expense added.');
    await reload();
  }
  async function remove(id: string) {
    if (!confirm('Delete this expense?')) return;
    try { setError(''); await api.deleteExpense(id); if (editing?.id === id) setEditing(undefined); await reload(); setMessage('Expense deleted.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete expense.'); }
  }
  function edit(expense: Expense) { setDetail(undefined); setEditing(expense); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const categoryName = (id: string) => categories.find(category => category.id === id)?.name || 'Uncategorized';
  return <>
    <div className="title"><div><span className="eyebrow">EXPENSE MANAGEMENT</span><h1>Expenses</h1></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    <section className="grid">
      <ExpenseForm categories={categories} editing={editing} onSave={save} onCancel={() => setEditing(undefined)} />
      <article className="panel"><h2>Find transactions</h2><ExpenseFilters categories={categories} />
        {loading ? <p role="status">Loading expenses…</p> : <>
          <p className="results">{filtered.length} matching expense{filtered.length === 1 ? '' : 's'}</p>
          <ExpenseList expenses={items} categoryName={categoryName} onOpen={setDetail} onEdit={edit} onDelete={remove} />
          {!items.length && <p>No expenses match these filters.</p>}
          {pages > 1 && <div className="pagination">
            <button className="secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {pages}</span>
            <button className="secondary" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>}
        </>}
      </article>
    </section>
    {detail && <ExpenseDetails expense={detail} categoryName={categoryName(detail.categoryId)}
      onClose={() => setDetail(undefined)} onEdit={() => edit(detail)} />}
  </>;
}
