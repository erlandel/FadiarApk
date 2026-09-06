import { apiClient, setAccessToken, setRefreshToken } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { AuthPayload, Person } from '@/types/auth';

export type LoginResponse = {
  user_info?: {
    person: Person;
    user: AuthPayload['user'];
    type: AuthPayload['type'];
    access_token: string;
    refresh_token: string;
  };
};

function extractUserInfo(data: any): AuthPayload | null {
  const userInfo = data?.user_info ?? data?.data?.user_info ?? null;
  if (!userInfo) return null;
  return {
    person: userInfo.person,
    user: userInfo.user,
    type: userInfo.type,
    access_token: userInfo.access_token,
    refresh_token: userInfo.refresh_token,
  };
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const { data } = await apiClient.post(ENDPOINTS.login, { email, password });
  const payload = extractUserInfo(data);
  if (!payload) throw new Error('No se pudo obtener la sesión');
  await setAccessToken(payload.access_token);
  await setRefreshToken(payload.refresh_token);
  return payload;
}

export async function register(payload: {
  name: string;
  lastname1: string;
  lastname2: string;
  email: string;
  password: string;
  type: string;
}): Promise<void> {
  await apiClient.post(ENDPOINTS.register, payload);
}

export async function verifyCodeEmail(code: string, email: string): Promise<AuthPayload | null> {
  const { data } = await apiClient.post(ENDPOINTS.verifyCodeEmail, { code, email });
  const payload = extractUserInfo(data?.login_info ?? data);
  if (payload) {
    await setAccessToken(payload.access_token);
    await setRefreshToken(payload.refresh_token);
  }
  return payload;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiClient.post(ENDPOINTS.resendVerificationEmail, { email });
}

export async function recoverCredentialsByEmail(email: string): Promise<void> {
  await apiClient.post(ENDPOINTS.recoverCredentialsByEmail, { email });
}