const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const roundMoney = (value) => (
  Math.round((Number(value) + Number.EPSILON) * 100) / 100
);

export const formatCurrency = (value) => {
  if (value == null || value === '') return '-';
  return currency.format(Number(value) || 0);
};

export const formatCurrencyRaw = (value) => {
  if (value == null || value === '') return 0;
  return Number(value) || 0;
};

export default { formatCurrency, formatCurrencyRaw };