export const server_url = 'https://app.fadiar.com:443/api/';

export const API_BASE = server_url.replace(/\/$/, '');

export const IMAGE_BASE = server_url;

export const EMISOR = 'web';

export const SUPPORT_PHONE = '+53 63513228';

export const buildImageUrl = (path: string, width?: 240 | 480 | 960): string => {
  const value = String(path ?? '').trim();
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('//')) return `https:${value}`;

  const base = IMAGE_BASE.replace(/\/$/, '');
  const normalizedPath = value.replace(/^\/+/, '').replace(/^api\//i, '');
  const url = new URL(`${base}/${normalizedPath}`);

  if (width) url.searchParams.set('ancho', String(width));
  return url.toString();
};
