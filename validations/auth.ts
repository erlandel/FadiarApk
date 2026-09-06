import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Por favor ingresa tu correo electrónico')
    .email('Debe ser un correo válido'),
  password: z.string().min(1, 'Por favor ingresa tu contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Error de escritura'),
    lastname1: z
      .string()
      .min(1, 'El primer apellido es requerido')
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Error de escritura'),
    lastname2: z
      .string()
      .min(1, 'El segundo apellido es requerido')
      .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Error de escritura'),
    email: z
      .string()
      .min(1, 'El correo es requerido')
      .email('Debe ser un correo válido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Por favor ingresa tu correo electrónico')
    .email('Debe ser un correo válido'),
});

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;