import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  recoverPasswordSchema,
  type RecoverPasswordFormData,
} from '@/validations/auth';
import { useRecoverPassword } from '@/hooks/auth/useRecoverPassword';
import { InputAuth } from '@/components/forms/inputAuth';
import { Button } from '@/components/primitives/button';

export default function RecoverPasswordScreen() {
  const { recover, isLoading } = useRecoverPassword();
  const { control, handleSubmit } = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' },
  });
  const [showErrors, setShowErrors] = useState(false);

  const onSubmit = (data: RecoverPasswordFormData) => {
    setShowErrors(true);
    recover(data.email);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e7e8e9' }}>
      <View className="flex-1 justify-center px-5">
        <View className="w-full rounded-2xl bg-white p-7 shadow-xl">
          <Text className="text-center text-3xl font-bold text-primary">
            Recuperar contraseña
          </Text>

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

          <Button
            title="Recuperar contraseña"
            className="mt-6"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-600">¿Recuerdas tu contraseña? </Text>
            <Link href="/(auth)/login" asChild>
              <Text className="text-sm font-medium text-primary">Volver al inicio de sesión</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}