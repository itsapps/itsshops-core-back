
export const createFormatHelpers = (locale: string) => ({
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => formatDate(locale, date, options),
  number: (num: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, num, options),
  currency: (num: number, currency = 'EUR') => formatCurrency(locale, num, currency),
});

export function formatDate(
  locale: string,
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = { 
    dateStyle: 'medium',
  }
) {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  options.timeZone = "Europe/Vienna";
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatNumber(locale: string, num: number | undefined, options?: Intl.NumberFormatOptions) {
  if (typeof num !== 'number') return '';
  // return (number).toLocaleString(locale, options);
  return new Intl.NumberFormat(locale, options).format(num);
}

export function formatCurrency(locale: string, num: number | undefined, currency = 'EUR') {
  return formatNumber(locale, num, {
    style: 'currency',
    currency
  })
}
