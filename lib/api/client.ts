import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from './config';
import { asyncStorage } from '../storage/storage';

export interface ApiClientConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const accessTokenKey = 'access_token';
const refreshTokenKey = 'refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function initAuthTokens(): Promise<void> {
  const [at, rt] = await Promise.all([
    asyncStorage.getString(accessTokenKey),
    asyncStorage.getString(refreshTokenKey),
  ]);
  accessToken = at;
  refreshToken = rt;
}

export async function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) await asyncStorage.setString(accessTokenKey, token);
  else await asyncStorage.remove(accessTokenKey);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (token) await asyncStorage.setString(refreshTokenKey, token);
  else await asyncStorage.remove(refreshTokenKey);
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const onUnauthorized = {
  listeners: new Set<() => void>(),
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  emit() {
    this.listeners.forEach((fn) => fn());
  },
};

let refreshing: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE}/refresh_token`, {
      refresh_token: refreshToken,
    });
    if (data?.access_token) {
      await setAccessToken(data.access_token);
      await setRefreshToken(data.refresh_token || refreshToken);
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = performRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as ApiClientConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      onUnauthorized.emit();
    }
    return Promise.reject(error);
  },
);