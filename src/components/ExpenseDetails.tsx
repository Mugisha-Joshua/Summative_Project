import { useEffect, useRef } from 'react';
import { Expense } from '../types';
export function ExpenseDetails({ expense, categoryName, onClose, onEdit }: {
  expense: Expense; categoryName: string; onClose: () => void; onEdit: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog className="modal" ref={dialog} onClose={() => { if (!dialog.current?.open) onClose(); }} aria-labelledby="expense-detail-title">
    <button className="link close" onClick={onClose}>Close ×</button><span className="eyebrow">EXPENSE DETAILS</span>
    <h2 id="expense-detail-title">{expense.title}</h2>
    <dl><dt>Amount</dt><dd>{expense.amount.toFixed(2)} USD</dd><dt>Category</dt><dd>{categoryName}</dd>
      <dt>Date</dt><dd>{expense.date}</dd><dt>Payment method</dt><dd>{expense.paymentMethod}</dd>
      <dt>Notes</dt><dd>{expense.notes || 'No notes added.'}</dd></dl>
    <button onClick={onEdit}>Edit this expense</button>
  </dialog>;
}
