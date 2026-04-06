import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Récupération initiale
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
      return initialValue;
    }
  });

  // Setter avec sauvegarde
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erreur écriture localStorage:', error);
    }
  };

  return [storedValue, setValue];
};