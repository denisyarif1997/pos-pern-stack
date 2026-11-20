export const getStorageKey = (userId, type) => `pos-${type}-${userId}`;

export const initialPaymentLines = () => [{ id: 'cash', method: 'cash', amount: '' }];

export const paymentMethods = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'card', label: 'Kartu' },
];

export const normalizePaymentLines = (lines) => {
  if (!Array.isArray(lines)) return initialPaymentLines();
  const usedMethods = new Set();
  const normalized = lines.filter((line) => {
    const valid =
      line &&
      paymentMethods.some((method) => method.value === line.method) &&
      !usedMethods.has(line.method);
    if (valid) usedMethods.add(line.method);
    return valid;
  }).map((line, index) => ({
    id: String(line.id || `payment-${index}`),
    method: line.method,
    amount: line.amount == null ? '' : String(line.amount),
  }));
  return normalized.length ? normalized : initialPaymentLines();
};

export const readStoredValue = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};