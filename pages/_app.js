import '../styles/globals.css'; // Importa tus estilos globales
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Puedes incluir aquí lógica si necesitas algo en el momento de la carga de la app
  }, []);

  return <Component {...pageProps} />; // Renderiza el componente de la página
}

export default MyApp;
