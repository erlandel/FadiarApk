import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  recoverPasswordSchema,
  type RecoverPasswordFormData,
} from '@/validations/auth';
import { asyncStorage } from '@/lib/storage/storage';
import { InputAuth } from '@/components/forms/inputAuth';
import { Button } from '@/components/primitives/button';

export default function EnterEmailScreen() {
  const router = useRouter();
  const { control, handleSubmit, getValues } = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    void asyncStorage.setString('verificationEmail', getValues('email'));
    router.push('/(auth)/verificationCodeEmail');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#e7e8e9]">
      <View className="flex-1 justify-center px-5">
        <View className="w-full rounded-2xl bg-white p-7 shadow-xl">
          <Text className="text-center text-3xl font-bold text-primary">Verificar cuenta</Text>

          <View className="mt-5">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputAuth
                  placeholder="Correo electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <Button title="Verificar cuenta" className="mt-6" onPress={handleSubmit(onSubmit)} />

          <View className="mt-6">
            <Link href="/(auth)/login" asChild>
              <Text className="text-center text-sm text-primary">Volver al inicio de sesión</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}