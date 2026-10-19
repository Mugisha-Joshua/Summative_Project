import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';
import { Budget, Category, Expense } from '../types';
import { StatCard } from '../components/StatCard';
import { summarizeMonth } from '../dashboard';
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ month, amount: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setSaved(false); setError('');
    Promise.all([api.allExpenses(), api.budget(month), api.categories()])
      .then(([items, currentBudget, loadedCategories]) => {
        if (!active) return;
        setExpenses(items); setBudget(currentBudget); setCategories(loadedCategories);
        setAmount(String(currentBudget.amount));
      }).catch(reason => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month]);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setSaved(false);
    try {
      const result = await api.saveBudget(month, Number(amount));
      setBudget(result); setAmount(String(result.amount)); setSaved(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save budget.'); }
    finally { setSaving(false); }
  }
  const summary = summarizeMonth(expenses, month, budget.amount);
  return <>
    <div className="title"><div><span className="eyebrow">MONTHLY OVERVIEW</span><h1>Your financial overview</h1></div>
      <label>Month<input type="month" required aria-label="Overview month" value={month} disabled={saving}
        onChange={event => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) setMonth(event.target.value); }} /></label></div>
    {error && <p role="alert" className="error">{error}</p>}
    {loading ? <p role="status">Loading your overview…</p> : <>
      <section className="stats">
        <StatCard label="Spent this month" value={money(summary.spent)} />
        <StatCard label="Remaining budget" value={budget.amount ? money(summary.remaining) : '—'} detail={summary.status} />
        <StatCard label="Highest expense" value={money(summary.highest?.amount || 0)} detail={summary.highest?.title || '—'} />
      </section>
      <section className="grid"><article className="panel"><h2>Monthly budget</h2>
        <form className="budget" onSubmit={save}><input aria-label="Monthly budget" required value={amount}
          onChange={event => { setAmount(event.target.value); setSaved(false); }} type="number" min="0" max="1000000000" step="0.01" />
          <button disabled={saving}>{saving ? 'Saving…' : 'Save budget'}</button></form>
        {saved && <p role="status" className="success">Budget saved successfully.</p>}
        <div className="progress"><i style={{ width: Math.min(100, budget.amount ? summary.spent / budget.amount * 100 : 0) + '%' }} /></div>
        <p>{money(summary.spent)} of {money(budget.amount)} used</p>
      </article><article className="panel"><h2>Spending by category</h2>
        {categories.filter(category => summary.categoryTotals[category.id]).map(category =>
          <div className="category" key={category.id}><span><i style={{ background: category.color }} />{category.name}</span>
            <b>{money(summary.categoryTotals[category.id] / 100)}</b></div>)}
        {!summary.recent.length && <p>No expenses for this month yet.</p>}
      </article></section>
      <article className="panel"><h2>Recent expenses · {month}</h2>{summary.recent.map(expense =>
        <div className="expense" key={expense.id}><span>{expense.title}<small>{expense.date} · {expense.paymentMethod}</small></span>
          <b>{money(expense.amount)}</b></div>)}
        {!summary.recent.length && <p>Your recent expenses will appear here.</p>}
      </article>
    </>}
  </>;
}
