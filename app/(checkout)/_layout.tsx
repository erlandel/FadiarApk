import { Stack } from 'expo-router';
import { colors } from '@/lib/theme/colors';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: colors.white },
      }}
    />
  );
}