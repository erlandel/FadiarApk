import { Stack } from 'expo-router';
import { AuthGate } from '@/components/navigation/authGate';

export default function AuthLayout() {
  return (
    <>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: '#e7e8e9' },
        }}
      />
    </>
  );
}