import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/validations/auth';
import { useRegister } from '@/hooks/auth/useRegister';
import { InputAuth } from '@/components/forms/inputAuth';
import { Button } from '@/components/primitives/button';

export default function RegisterScreen() {
  const { register, isLoading } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastname1: '',
      lastname2: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [showErrors, setShowErrors] = useState(false);

  const onSubmit = (data: RegisterFormData) => {
    setShowErrors(true);
    register({
      name: data.name,
      lastname1: data.lastname1,
      lastname2: data.lastname2,
      email: data.email,
      password: data.password,
      type: 'Cliente',
    });
  };

  const field = (name: keyof RegisterFormData, props: any) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <InputAuth
          value={value}
          onBlur={onBlur}
          onChangeText={onChange}
          error={showErrors && !!errors[name]}
          errorMessage={errors[name]?.message}
          {...props}
        />
      )}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#e7e8e9]">
      <ScrollView contentContainerClassName="justify-center px-5 py-8">
        <View className="w-full rounded-2xl bg-white p-7 shadow-xl">
          <Text className="text-center text-3xl font-bold text-primary">Registrarse</Text>
          <Text className="mt-1 text-center text-sm text-gray-600">
            Completa todos los campos para continuar
          </Text>

          <View className="mt-5 gap-4">
            <View className="gap-1">
              {field('name', { placeholder: 'Nombre' })}
            </View>
            {field('lastname1', { placeholder: 'Primer apellido' })}
            {field('lastname2', { placeholder: 'Segundo apellido' })}
            {field('email', {
              placeholder: 'Correo electrónico',
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
            {field('password', { placeholder: 'Contraseña', secureTextEntry: true })}
            {field('confirmPassword', {
              placeholder: 'Confirmar contraseña',
              secureTextEntry: true,
            })}
          </View>

          <Button
            title="Registrarse"
            className="mt-6"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-600">¿Ya tienes una cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-sm font-medium text-primary">Iniciar sesión</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}