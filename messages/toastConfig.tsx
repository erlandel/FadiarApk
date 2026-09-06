import Toast, { type ToastConfig } from 'react-native-toast-message';
import { Text, View } from 'react-native';
import { colors } from '@/lib/theme/colors';

function BaseToast({ text1, text2 }: { text1?: string; text2?: string }) {
  return (
    <View className="mx-4 rounded-xl bg-primary px-4 py-3">
      {text1 ? <Text className="text-sm font-bold text-white">{text1}</Text> : null}
      {text2 ? <Text className="text-sm text-white/90">{text2}</Text> : null}
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (internal) => <BaseToast {...internal} />,
  error: (internal) => <BaseToast {...internal} />,
  info: (internal) => <BaseToast {...internal} />,
};

export function ToastRoot() {
  return <Toast config={toastConfig} />;
}

export { colors };