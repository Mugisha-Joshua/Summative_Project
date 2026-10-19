import { FormEvent, useEffect, useState } from 'react';
import { Category, Expense } from '../types';
type Draft = { title: string; amount: string; categoryId: string; date: string; paymentMethod: string; notes: string };
const blank = (): Draft => ({ title: '', amount: '', categoryId: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'Card', notes: '' });
export function ExpenseForm({ categories, editing, onSave, onCancel }: {
  categories: Category[]; editing?: Expense;
  onSave: (expense: Partial<Expense>) => Promise<void>; onCancel: () => void;
}) {
  const [form, setForm] = useState(blank), [pending, setPending] = useState(false), [error, setError] = useState('');
  useEffect(() => { setForm(editing ? { ...editing, amount: String(editing.amount), notes: editing.notes || '' } : blank()); setError(''); }, [editing]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    try { await onSave({ ...form, id: editing?.id, amount: Number(form.amount) }); setForm(blank()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save expense.'); }
    finally { setPending(false); }
  }
  return <form className="panel" onSubmit={submit}><h2>{editing ? 'Edit expense' : 'Add an expense'}</h2>
    {error && <p className="error" role="alert">{error}</p>}
    <label>Title<input required maxLength={120} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
    <label>Amount<input required min="0.01" max="1000000000" step="0.01" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></label>
    <label>Category<select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
      <option value="">Choose a category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
    <label>Payment method<select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
      <option>Card</option><option>Cash</option><option>Mobile Money</option><option>Bank Transfer</option></select></label>
    <label>Notes<textarea maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
    <button disabled={pending}>{pending ? 'Saving…' : editing ? 'Update expense' : 'Add expense'}</button>
    {editing && <button disabled={pending} type="button" className="secondary" onClick={onCancel}>Cancel</button>}
  </form>;
}
