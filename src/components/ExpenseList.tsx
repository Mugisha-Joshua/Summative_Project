import { Expense } from '../types';
export function ExpenseList({ expenses, categoryName, onOpen, onEdit, onDelete }: {
  expenses: Expense[]; categoryName: (id: string) => string;
  onOpen: (expense: Expense) => void; onEdit: (expense: Expense) => void; onDelete: (id: string) => void;
}) {
  return <div className="list">{expenses.map(expense => <div className="expense" key={expense.id}>
    <button className="expense-title" onClick={() => onOpen(expense)}>{expense.title}
      <small>{expense.date} · {categoryName(expense.categoryId)} · {expense.paymentMethod}</small></button>
    <b>{expense.amount.toFixed(2)} USD</b>
    <button className="link" aria-label={'Edit ' + expense.title} onClick={() => onEdit(expense)}>Edit</button>
    <button className="link danger" aria-label={'Delete ' + expense.title} onClick={() => onDelete(expense.id)}>Delete</button>
  </div>)}</div>;
}
