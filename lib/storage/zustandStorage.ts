import { StateStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

export const zustandStorage: StateStorage = {
  getItem: async (name) => (await asyncStorage.getString(name)) ?? null,
  setItem: async (name, value) => {
    await asyncStorage.setString(name, value);
  },
  removeItem: async (name) => {
    await asyncStorage.remove(name);
  },
};