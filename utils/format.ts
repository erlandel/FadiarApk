import dayjs from 'dayjs';

export function formatPrice(value: number | string, currency = 'USD'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '0.00';
  return `$ ${num.toFixed(2)} ${currency}`;
}

export function parsePrice(value: string | number): number {
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function formatDate(date: string): string {
  return dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : date;
}

export function formatTime(time: string): string {
  return time;
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function formatCountdown(expiry: number, now: number): string {
  const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
  if (remaining === 0) return 'Expirado';
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}