import { useState, useEffect } from 'react';

function useMediaQuery(query: string) {
  // Estado para almacenar si el media query se cumple o no
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Crea un objeto MediaQueryList
    const mediaQuery = window.matchMedia(query);

    // Establece el estado inicial basado en si la query se cumple
    setMatches(mediaQuery.matches);

    // Función que se ejecuta cada vez que cambia el estado del media query
    const handleChange = (e) => setMatches(e.matches);

    // Escucha cambios en el media query
    mediaQuery.addEventListener('change', handleChange);

    // Limpia el listener cuando se desmonta el componente
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches; // Devuelve si el media query se cumple o no
}

export default useMediaQuery;
