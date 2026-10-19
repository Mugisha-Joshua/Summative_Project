import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reset, selectFilteredExpenses, setExpenses, setFilters, store } from '../src/store';
import { summarizeMonth } from '../src/dashboard';
import { Expense } from '../src/types';
const items: Expense[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i), title: i % 2 ? 'Bus ride' : 'Lunch [special]', amount: i + 1,
  date: '2026-10-' + String(i + 1).padStart(2, '0'), categoryId: i % 2 ? 'transport' : 'food',
  paymentMethod: i % 2 ? 'Cash' : 'Card', createdAt: '2026-10-01T00:00:00.000Z'
}));
function setup() { store.dispatch(reset()); store.dispatch(setExpenses(items)); }
test('Redux search treats regex symbols as literal text', () => {
  setup(); store.dispatch(setFilters({ search: '[SPECIAL]' }));
  assert.equal(selectFilteredExpenses(store.getState()).length, 6);
});
test('Redux combines category, payment, date and amount filters', () => {
  setup(); store.dispatch(setFilters({ category: 'food', payment: 'Card', dateFrom: '2026-10-03',
    dateTo: '2026-10-09', minAmount: '5', maxAmount: '8' }));
  assert.deepEqual(selectFilteredExpenses(store.getState()).map(e => e.amount), [7, 5]);
});
test('Redux supports both date and amount sorting directions', () => {
  setup();
  for (const sort of ['date', 'amount'] as const) {
    store.dispatch(setFilters({ sort, direction: 'asc' }));
    assert.equal(selectFilteredExpenses(store.getState())[0].id, '0');
    store.dispatch(setFilters({ direction: 'desc' }));
    assert.equal(selectFilteredExpenses(store.getState())[0].id, '11');
  }
  assert.equal(store.getState().expenses[0].id, '0', 'sorting does not mutate the ledger');
});
test('reset restores all filters and empty results are safe', () => {
  setup(); store.dispatch(setFilters({ search: 'absent' }));
  assert.equal(selectFilteredExpenses(store.getState()).length, 0);
  store.dispatch(reset()); assert.equal(selectFilteredExpenses(store.getState()).length, 12);
});
test('monthly overview includes records beyond page one', () => {
  const summary = summarizeMonth(items, '2026-10', 100);
  assert.equal(summary.spent, 78); assert.equal(summary.remaining, 22);
  assert.equal(summary.highest?.amount, 12); assert.equal(summary.categoryTotals.food, 3600);
  assert.equal(summary.recent.length, 5); assert.equal(summary.recent[0].id, '11');
});
test('overview excludes other months and handles empty months', () => {
  assert.equal(summarizeMonth(items, '2026-09', 100).spent, 0);
  assert.equal(summarizeMonth([], '2026-10', 100).highest, undefined);
});
test('budget statuses cover no budget, within, approaching and over', () => {
  assert.equal(summarizeMonth(items, '2026-10', 0).status, 'No budget set');
  assert.equal(summarizeMonth(items, '2026-10', 100).status, 'Within budget');
  assert.equal(summarizeMonth(items, '2026-10', 90).status, 'Approaching limit');
  assert.equal(summarizeMonth(items, '2026-10', 78).status, 'Approaching limit');
  assert.equal(summarizeMonth(items, '2026-10', 50).status, 'Over budget');
});
test('overview money sums use cents', () => {
  assert.equal(summarizeMonth([{ ...items[0], amount: .1 }, { ...items[1], amount: .2 }], '2026-10', 1).spent, .3);
});
