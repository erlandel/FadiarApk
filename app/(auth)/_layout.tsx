import { Stack } from 'expo-router';
import { colors } from '@/lib/theme/colors';
import { AuthGate } from '@/components/navigation/authGate';

export default function AuthLayout() {
  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: colors.white },
        }}
      />
    </AuthGate>
  );
}