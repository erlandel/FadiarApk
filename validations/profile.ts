import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const personalDataSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras'),
  lastName: z
    .string()
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Los apellidos solo pueden contener letras')
    .refine(
      (val) => {
        const parts = val.trim().split(/\s+/);
        return parts.length >= 2;
      },
      { message: 'Debe ingresar ambos apellidos' },
    ),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Debe ser un correo válido'),
  phone: z.string().min(1, 'El teléfono es requerido').superRefine((val, ctx) => {
    const phone = val.trim();
    if (!/^\+[\d\s]+$/.test(phone)) {
      ctx.addIssue({
        code: 'custom',
        message: "El teléfono solo puede contener el '+' del código, números y espacios",
      });
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      ctx.addIssue({ code: 'custom', message: 'Número de teléfono inválido' });
    }
  }),
});

export type PersonalDataFormData = z.infer<typeof personalDataSchema>;

export const addressSchema = z.object({
  address: z.string().min(1, { message: 'La dirección es requerida' }),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const updatePasswordSchema = z.object({
  password: z.string().min(1, { message: 'La contraseña actual es requerida' }),
  confirmPassword: z.string().min(6, { message: 'Debe tener al menos 6 caracteres' }),
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;