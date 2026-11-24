export const createFormatHelpers = (locale: string) => ({
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
    formatDate(locale, date, options),
  number: (num: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, num, options),
  currency: (num: number, currency = 'EUR') => formatCurrency(locale, num, currency),
  dateFormat: (dateType: 'date' | 'datetime') => dateFormat(locale, dateType),
})

export function formatDate(
  locale: string,
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
  },
): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date
  options.timeZone = 'Europe/Vienna'
  return new Intl.DateTimeFormat(locale, options).format(d)
}

export function dateFormat(
  locale: string,
  dateType: 'date' | 'datetime',
): { dateFormat: string; timeFormat?: string } {
  const datePart = locale === 'de' ? 'DD.MM.YYYY' : 'YYYY-MM-DD'
  if (dateType === 'date') return { dateFormat: datePart }
  return { dateFormat: datePart, timeFormat: 'HH:mm' }
}

export function formatNumber(
  locale: string,
  num: number | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (typeof num !== 'number') return ''
  // return (number).toLocaleString(locale, options);
  return new Intl.NumberFormat(locale, options).format(num)
}

export function formatCurrency(locale: string, num: number | undefined, currency = 'EUR'): string {
  return formatNumber(locale, num, {
    style: 'currency',
    currency,
  })
}
