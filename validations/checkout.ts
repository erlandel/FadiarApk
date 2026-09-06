import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const cart1Schema = z
  .object({
    firstName: z.string().optional().or(z.literal('')),
    lastName1: z.string().optional().or(z.literal('')),
    lastName2: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    identityCard: z.string().optional().or(z.literal('')),
    province: z.string().optional().or(z.literal('')),
    municipality: z.string().optional().or(z.literal('')),
    delivery: z.boolean(),
    address: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.delivery) {
      if (!data.firstName || data.firstName.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'El nombre es requerido', path: ['firstName'] });
      } else if (!lettersRegex.test(data.firstName)) {
        ctx.addIssue({ code: 'custom', message: 'El nombre solo puede contener letras', path: ['firstName'] });
      }

      if (!data.lastName1 || data.lastName1.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'El primer apellido es requerido', path: ['lastName1'] });
      } else if (!lettersRegex.test(data.lastName1)) {
        ctx.addIssue({ code: 'custom', message: 'El primer apellido solo puede contener letras', path: ['lastName1'] });
      }

      if (!data.lastName2 || data.lastName2.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'El segundo apellido es requerido', path: ['lastName2'] });
      } else if (!lettersRegex.test(data.lastName2)) {
        ctx.addIssue({ code: 'custom', message: 'El segundo apellido solo puede contener letras', path: ['lastName2'] });
      }

      if (!data.province || data.province.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'La provincia es requerida', path: ['province'] });
      }

      if (!data.municipality || data.municipality.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'El municipio es requerido', path: ['municipality'] });
      }

      if (!data.phone || data.phone.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'El teléfono es requerido', path: ['phone'] });
      } else {
        const phone = data.phone.trim();
        if (!/^\+[\d\s]+$/.test(phone)) {
          ctx.addIssue({ code: 'custom', message: "El teléfono solo puede contener el '+' del código, números y espacios", path: ['phone'] });
          return;
        }
        const phoneNumber = parsePhoneNumberFromString(phone);
        if (!phoneNumber || !phoneNumber.isValid()) {
          ctx.addIssue({ code: 'custom', message: 'Número de teléfono no válido', path: ['phone'] });
        }
      }

      if (!data.address || data.address.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'La dirección es requerida para entrega a domicilio', path: ['address'] });
      }
    }

    if (data.identityCard && data.identityCard.trim() !== '') {
      if (!/^\d+$/.test(data.identityCard)) {
        ctx.addIssue({ code: 'custom', message: 'Solo números', path: ['identityCard'] });
      }
    }
  });

export type Cart1FormData = z.infer<typeof cart1Schema>;

export const deliveryMethodSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida').min(5, 'La dirección debe tener al menos 5 caracteres'),
  note: z.string().optional(),
});

export type DeliveryMethodFormData = z.infer<typeof deliveryMethodSchema>;