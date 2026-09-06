import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersistStorage {
  getString: (key: string) => Promise<string | null>;
  setString: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export const asyncStorage: PersistStorage = {
  getString: (key) => AsyncStorage.getItem(key),
  setString: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
};

export const clearAllStorage = async () => {
  await AsyncStorage.clear();
};