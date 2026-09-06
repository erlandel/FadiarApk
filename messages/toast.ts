import Toast from 'react-native-toast-message';

const visibilityTime = 4000;
const text1Style = {
  fontSize: 14,
  fontWeight: '600' as const,
};

export function toastError(message: string) {
  Toast.show({ type: 'error', text1: 'Error', text2: message, visibilityTime, text1Style });
}

export function toastSuccess(message: string) {
  Toast.show({ type: 'success', text1: 'Éxito', text2: message, visibilityTime, text1Style });
}

export function toastWarning(message: string) {
  Toast.show({ type: 'info', text1: 'Aviso', text2: message, visibilityTime, text1Style });
}

export function toastInfo(message: string) {
  Toast.show({ type: 'info', text1: 'Información', text2: message, visibilityTime, text1Style });
}