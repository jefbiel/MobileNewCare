import { useEffect, useState } from 'react';
import { getItem, saveItem } from '../services/storage';

//// Gera a chave única para salvar os dados de hidratação do dia atual
function keyHoje() {
  const d = new Date();
  return `@samvita:hydra:${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

// Hook personalizado para gerenciar a hidratação diária do usuário
export function useHydration() {
  const [totalHoje, setTotalHoje] = useState(0);
  const [metaMl, setMetaMlState] = useState(2000);

  useEffect(() => {
    (async () => {

      // Carrega os dados salvos de meta e total de hoje ao montar o hook
      const meta = await getItem('@samvita:meta_hidra');
      if (meta) setMetaMlState(Number(meta));
      const t = await getItem(keyHoje());
      setTotalHoje(Number(t || 0));
    })();
  }, []);

  const setMetaMl = async (ml: number) => {
    setMetaMlState(ml);
    await saveItem('@samvita:meta_hidra', String(ml));
  };

  // Registra um copo de água consumido e atualiza o total de hoje
  const registrarCopo = async (ml: number) => {
    const novo = totalHoje + ml;
    setTotalHoje(novo); 
    await saveItem(keyHoje(), String(novo)); 
  };

  return { totalHoje, metaMl, setMetaMl, registrarCopo };
}
