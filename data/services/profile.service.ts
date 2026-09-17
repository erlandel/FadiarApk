import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import type { AuthPayload } from '@/types/auth';

export interface UserChange {
  operation: string;
  table: string;
  attribute: string;
  value: string;
}

export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface UserImageResponse {
  img?: string | null;
}

export async function editUser(params: {
  ci: string;
  id_user: string;
  changes: UserChange[];
  currentPassword: string;
  file?: ImageFile | null;
}): Promise<{ access_token: string }> {
  const formData = new FormData();
  formData.append('ci', params.ci);
  formData.append('id_user', params.id_user);
  formData.append('current_password', params.currentPassword);
  formData.append('changes', JSON.stringify(params.changes));

  if (params.file) {
    formData.append('file', params.file as unknown as Blob);
  }

  const { data } = await apiClient.post(ENDPOINTS.editUser, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });

  return data;
}

export async function getUserImageName(
  idUser: string,
): Promise<UserImageResponse> {
  const { data } = await apiClient.post(ENDPOINTS.getUserImageName, {
    id_user: idUser,
  });

  return data?.data ?? data;
}

export async function updatePersonLocally(partial: Partial<AuthPayload>): Promise<void> {
  const state = useAuthStore.getState();
  if (state.auth) {
    state.updateAuth(partial);
  }
}
