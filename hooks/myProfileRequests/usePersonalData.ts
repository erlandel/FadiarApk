import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import useImgFileStore from '@/store/imgFileStore';
import {
  personalDataSchema,
  addressSchema,
  updatePasswordSchema,
} from '@/validations/profile';
import { toastError, toastSuccess, toastWarning } from '@/messages/toast';
import {
  editUser,
  getUserImageName,
  type UserChange,
} from '@/data/services/profile.service';

export function usePersonalData() {
  const auth = useAuthStore((s) => s.auth);
  const updateAuth = useAuthStore((s) => s.updateAuth);
  const { pendingAvatar, clearPendingAvatar } = useImgFileStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialized = useRef(false);

  const [formData, setFormData] = useState({
    firstName: auth?.person?.name || '',
    lastName: `${auth?.person?.lastname1 || ''} ${auth?.person?.lastname2 || ''}`.trim(),
    email: auth?.user?.email || '',
    phone: auth?.person?.cellphone1 || '',
    address: auth?.person?.address || '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (auth?.person && !initialized.current) {
      initialized.current = true;
      setFormData({
        firstName: auth.person.name,
        lastName: `${auth.person.lastname1} ${auth.person.lastname2 ?? ''}`.trim(),
        email: auth.user.email,
        phone: auth.person.cellphone1 || '',
        address: auth.person.address || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [auth]);

  const personalDataMutation = useMutation({
    mutationFn: async (payload: {
      cambios: UserChange[];
      currentPassword: string;
      file: { uri: string; name: string; type: string } | null;
      firstName: string;
      lastname1: string;
      lastname2: string;
      phone: string;
    }) => {
      if (!auth) throw new Error('No hay sesión activa');
      const result = await editUser({
        ci: auth.person.id,
        id_user: auth.user.id,
        changes: payload.cambios,
        currentPassword: payload.currentPassword,
        file: payload.file,
      });

      let imageName = payload.file?.name ?? null;
      if (payload.file) {
        try {
          imageName =
            (await getUserImageName(auth.user.id)).img ??
            imageName;
        } catch (error) {
          console.error(
            'No se pudo confirmar el nombre del avatar:',
            error,
          );
        }
      }

      return { ...result, imageName };
    },
    onSuccess: (result, variables) => {
      if (!auth) return;

      toastSuccess('Datos personales actualizados correctamente');

      if (variables.file) {
        clearPendingAvatar();
      }

      updateAuth({
        access_token: result?.access_token || auth.access_token,
        person: {
          ...auth.person,
          name: variables.firstName,
          lastname1: variables.lastname1,
          lastname2: variables.lastname2,
          cellphone1: variables.phone,
        },
        user: {
          ...auth.user,
          img: result.imageName ?? auth.user.img,
        },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo actualizar los datos';
      toastError(`Error: ${message}`);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!auth) throw new Error('No hay sesión activa');
      const cambios: UserChange[] = [
        {
          operation: 'UPDATE',
          table: 'users',
          attribute: 'password',
          value: payload.newPassword,
        },
      ];
      return editUser({
        ci: auth.person.id,
        id_user: auth.user.id,
        changes: cambios,
        currentPassword: payload.currentPassword,
      });
    },
    onSuccess: () => {
      toastSuccess('Contraseña actualizada correctamente');
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo actualizar la contraseña';
      toastError(`Error: ${message}`);
    },
  });

  const addressMutation = useMutation({
    mutationFn: (payload: {
      address: string;
      currentPassword: string;
    }) => {
      if (!auth) throw new Error('No hay sesión activa');
      const cambios: UserChange[] = [
        {
          operation: 'UPDATE',
          table: 'persons',
          attribute: 'address',
          value: payload.address,
        },
      ];
      return editUser({
        ci: auth.person.id,
        id_user: auth.user.id,
        changes: cambios,
        currentPassword: payload.currentPassword,
      });
    },
    onSuccess: (result, variables) => {
      if (!auth) return;
      toastSuccess('Dirección actualizada correctamente');
      updateAuth({
        access_token: result?.access_token || auth.access_token,
        person: {
          ...auth.person,
          address: variables.address,
        },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo actualizar la dirección';
      toastError(`Error: ${message}`);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    if (errors.phone) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const handleSavePersonalData = async () => {
    if (!auth) return;

    const result = personalDataSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          fieldErrors[path as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const nameParts = formData.lastName.trim().split(/\s+/);
    const lastname1 = nameParts[0] || '';
    const lastname2 = nameParts.slice(1).join(' ') || '';

    const cambios: UserChange[] = [];

    if (formData.firstName !== auth.person.name) {
      cambios.push({
        operation: 'UPDATE',
        table: 'persons',
        attribute: 'name',
        value: formData.firstName,
      });
    }

    if (lastname1 !== auth.person.lastname1) {
      cambios.push({
        operation: 'UPDATE',
        table: 'persons',
        attribute: 'lastname1',
        value: lastname1,
      });
    }

    if (lastname2 !== (auth.person.lastname2 || '')) {
      cambios.push({
        operation: 'UPDATE',
        table: 'persons',
        attribute: 'lastname2',
        value: lastname2,
      });
    }

    if (formData.phone !== (auth.person.cellphone1 || '')) {
      cambios.push({
        operation: 'UPDATE',
        table: 'persons',
        attribute: 'cellphone1',
        value: formData.phone,
      });
    }

    if (pendingAvatar) {
      cambios.push({
        operation: 'update',
        table: 'users',
        attribute: 'img',
        value: pendingAvatar.name,
      });
    }

    if (cambios.length === 0) {
      toastWarning('No se detectaron cambios para actualizar');
      return;
    }

    personalDataMutation.mutate({
      cambios,
      currentPassword: formData.password || auth.user.password || '',
      file: pendingAvatar || null,
      firstName: formData.firstName,
      lastname1,
      lastname2,
      phone: formData.phone,
    });
  };

  const handleSaveAddress = async () => {
    if (!auth) return;

    const result = addressSchema.safeParse({ address: formData.address });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          fieldErrors[path as string] = issue.message;
        }
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.address;
      return newErrors;
    });

    const currentAddress = (formData.address || '').trim();
    const originalAddress = (auth.person.address || '').trim();

    if (currentAddress === originalAddress) {
      toastWarning('No se detectaron cambios en la dirección');
      return;
    }

    addressMutation.mutate({
      address: currentAddress,
      currentPassword: formData.password || auth.user.password || '',
    });
  };

  const handleUpdatePassword = async () => {
    if (!auth) return;

    const result = updatePasswordSchema.safeParse({
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          fieldErrors[path as string] = issue.message;
        }
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      return newErrors;
    });

    if (formData.confirmPassword === formData.password) {
      toastError('La nueva contraseña no puede ser igual a la actual');
      return;
    }

    passwordMutation.mutate({
      currentPassword: formData.password || auth.user.password || '',
      newPassword: formData.confirmPassword,
    });
  };

  return {
    formData,
    errors,
    handleInputChange,
    handlePhoneChange,
    handleSavePersonalData,
    handleSaveAddress,
    handleUpdatePassword,
    isPersonalDataPending: personalDataMutation.isPending,
    isAddressPending: addressMutation.isPending,
    isPasswordPending: passwordMutation.isPending,
  };
}
