import { thumbHashToDataURL } from 'thumbhash';

export function thumbHashToPreview(hash?: string | null): string | null {
  if (!hash || !hash.trim()) return null;

  try {
    const bytes = Uint8Array.from(atob(hash), (character) => character.charCodeAt(0));
    return thumbHashToDataURL(bytes);
  } catch {
    return null;
  }
}
