import { useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lanotes-theme';

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // sin acceso a localStorage: se usa el tema del sistema
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = next;
    setTheme(next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // la preferencia solo dura esta sesión
    }
  }

  return { theme, toggle };
}
