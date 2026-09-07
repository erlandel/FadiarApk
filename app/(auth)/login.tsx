import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/validations/auth';
import { useLogin } from '@/hooks/auth/useLogin';
import { InputAuth } from '@/components/forms/inputAuth';
import { Button } from '@/components/primitives/button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [showErrors, setShowErrors] = useState(false);

  const onSubmit = (data: LoginFormData) => {
    setShowErrors(true);
    login(data);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e7e8e9' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full rounded-2xl bg-white p-7 shadow-xl">
          <Text className="text-center text-3xl font-bold text-primary">
            Iniciar sesión
          </Text>

          <View className="mt-5 gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputAuth
                  placeholder="Correo electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leadingIcon="Mail"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={showErrors && !!errors.email}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputAuth
                  placeholder="Contraseña"
                  secureTextEntry
                  leadingIcon="Lock"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={showErrors && !!errors.password}
                  errorMessage={errors.password?.message}
                />
              )}
            />
          </View>

          <Button
            title="Iniciar sesión"
            className="mt-6"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />

          <View className="mt-6 gap-2 text-center">
            <View className="flex-row justify-center">
              <Text className="text-sm text-gray-600">¿No tienes una cuenta? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-sm text-primary font-medium">Regístrate ahora</Text>
                </Pressable>
              </Link>
            </View>
            <Link href="/(auth)/recoverPassword" asChild>
              <Pressable>
                <Text className="text-center text-sm text-primary">
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/enterEmail" asChild>
              <Pressable>
                <Text className="text-center text-sm text-primary">
                  ¿No has verificado tu cuenta?
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}