import { useEffect, useState } from 'react';
import { getItem, saveItem } from '../services/storage';

// Hook personalizado para gerenciar o tema da aplicação
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); 


  // Carrega o tema salvo ao montar um hook
  useEffect(() => {
    (async () => {
      const t = await getItem('@samvita:theme');
      if (t === 'dark' || t === 'light') setTheme(t);
    })();
  }, []);

  // Alterna entre os temas claro e escuro, salvando a escolha
  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await saveItem('@samvita:theme', next);
  };

  return { theme, toggleTheme };
}
