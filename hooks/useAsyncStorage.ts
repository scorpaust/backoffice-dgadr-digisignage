import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/**
 * Hook para gerenciar dados do AsyncStorage de forma otimizada
 * @param key - Chave do AsyncStorage
 * @param defaultValue - Valor padrão
 * @returns [value, setValue, loading, error]
 */
export function useAsyncStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        setError(null);
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  const setValue = async (value: T) => {
    try {
      setError(null);
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  return [storedValue, setValue, loading, error];
}
