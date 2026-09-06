import { useMutation } from '@tanstack/react-query';
import { editUser, type UserChange } from '../../data/services/profile.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess, toastWarning } from '@/messages/toast';

export interface SavePersonalPayload {
  firstName: string;
  lastname1: string;
  lastname2: string;
  phone: string;
  currentPassword: string;
  changes: UserChange[];
}

export function usePersonalData() {
  const auth = useAuthStore((s) => s.auth);
  const updateAuth = useAuthStore((s) => s.updateAuth);

  const mutation = useMutation({
    mutationFn: (payload: SavePersonalPayload) => {
      if (!auth) throw new Error('No hay sesión activa');
      return editUser({
        ci: auth.person.id,
        id_user: auth.user.id,
        changes: payload.changes,
        currentPassword: payload.currentPassword,
      });
    },
    onSuccess: (result, variables) => {
      if (!auth) return;
      updateAuth({
        access_token: result?.access_token || auth.access_token,
        person: {
          ...auth.person,
          name: variables.firstName,
          lastname1: variables.lastname1,
          lastname2: variables.lastname2,
          cellphone1: variables.phone,
        },
      });
      toastSuccess('Datos personales actualizados correctamente');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || 'No se pudieron actualizar los datos';
      toastError(`Error: ${message}`);
    },
  });

  const logout = () => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().resetShouldClearCartAfterOrder();
    toastWarning('Sesión cerrada');
  };

  return {
    savePersonal: mutation.mutate,
    isPending: mutation.isPending,
    auth,
    logout,
  };
}