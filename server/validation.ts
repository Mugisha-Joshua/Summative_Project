export const paymentMethods = ['Card', 'Cash', 'Mobile Money', 'Bank Transfer'] as const;
export const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
export const validDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export function validAmount(value: unknown, allowZero = false): value is number {
  return typeof value === 'number' && Number.isFinite(value) &&
    value >= (allowZero ? 0 : 0.01) && value <= 1_000_000_000 &&
    Math.abs(value * 100 - Math.round(value * 100)) < 0.0001;
}
export const cleanText = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
