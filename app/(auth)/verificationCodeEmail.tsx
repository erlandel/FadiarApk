import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { asyncStorage } from '@/lib/storage/storage';
import { useVerifyEmail } from '@/hooks/auth/useVerifyEmail';
import { useResendCode } from '@/hooks/auth/useResendCode';
import { CodeInput } from '@/components/forms/codeInput';
import { Button } from '@/components/primitives/button';

export default function VerificationCodeEmailScreen() {
  const router = useRouter();
  const { verify, isLoading } = useVerifyEmail();
  const { resend, isLoading: resending } = useResendCode();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    void asyncStorage.getString('verificationEmail').then((stored) => {
      if (stored) setEmail(stored);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#e7e8e9]">
      <View className="flex-1 justify-center px-5">
        <View className="w-full rounded-2xl bg-white p-7 shadow-xl">
          <Text className="text-center text-3xl font-bold text-primary">Verificar cuenta</Text>
          <Text className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un código de verificación de 6 dígitos a:
          </Text>
          <Text className="mt-2 text-center font-bold text-primary">{email}</Text>

          <View className="mt-6">
            <CodeInput length={6} value={code} onChange={setCode} />
          </View>

          <Button
            title="Verificar cuenta"
            className="mt-6"
            disabled={code.trim().length !== 6}
            loading={isLoading}
            onPress={() => verify({ code: code.trim(), email: email.trim() })}
          />

          <View className="mt-5 flex-row justify-center">
            <Text className="text-sm text-gray-500">¿No recibiste el código? </Text>
            <Pressable onPress={() => email && resend(email)}>
              <Text className="text-sm text-primary">
                {resending ? 'Enviando...' : 'Reenviar código'}
              </Text>
            </Pressable>
          </View>

          <View className="mt-4">
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-center text-sm text-primary">Volver al inicio de sesión</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}