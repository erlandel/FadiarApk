export const server_url = 'https://app.fadiar.com:8443/api/';

export const API_BASE = server_url.replace(/\/$/, '');

export const IMAGE_BASE = server_url;

export const EMISOR = 'web';

export const SUPPORT_PHONE = '+53 63513228';

export const buildImageUrl = (path: string): string => {
	if (/^https?:\/\//i.test(path)) return path;
	const base = IMAGE_BASE.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\/+/, '');
	return `${base}/${normalizedPath}`;
};