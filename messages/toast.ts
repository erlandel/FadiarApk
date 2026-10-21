import Toast, { type ToastShowParams } from 'react-native-toast-message';

export const TOAST_DURATION = 5000;

let toastId = 0;
let activeToast: { id: number; expiresAt: number; params: ToastShowParams } | undefined;

// Native modals own a separate Toast host. Keep the remaining lifetime when
// a modal opens/closes (for example, immediately after saving an address).
export function restoreActiveToast() {
  if (!activeToast) {
    Toast.hide();
    return;
  }
  const remaining = activeToast.expiresAt - Date.now();
  if (remaining <= 0) {
    activeToast = undefined;
    Toast.hide();
    return;
  }
  Toast.show({ ...activeToast.params, visibilityTime: remaining });
}

function showToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  const id = ++toastId;
  const titles = { success: 'Éxito', error: 'Error', warning: 'Aviso', info: 'Información' };
  const params: ToastShowParams = {
    type: type === 'warning' ? 'info' : type,
    text1: titles[type],
    text2: message,
    position: 'top',
    visibilityTime: TOAST_DURATION,
    onHide: () => {
      if (activeToast?.id === id) activeToast = undefined;
    },
  };
  activeToast = { id, expiresAt: Date.now() + TOAST_DURATION, params };
  Toast.show(params);
}

export function toastError(message: string) {
  showToast('error', message);
}

export function toastSuccess(message: string) {
  showToast('success', message);
}

export function toastWarning(message: string) {
  showToast('warning', message);
}

export function toastInfo(message: string) {
  showToast('info', message);
}
