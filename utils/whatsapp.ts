import { Linking } from 'react-native';

export function openWhatsAppHelp(
  orderId: string | number,
  supportNumber = '+53 63513228',
) {
  const label = String(orderId).startsWith('#') ? String(orderId) : `#${orderId}`;
  const message = encodeURIComponent(`Hola, necesito ayuda con el pedido ${label}.`);
  const phoneDigits = supportNumber.replace(/[^\d]/g, '');
  const url = `https://wa.me/${phoneDigits}?text=${message}`;
  Linking.openURL(url).catch(() => {});
}