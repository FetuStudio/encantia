// pages/_app.js
import '../styles/globals.css';  // Importa tu archivo CSS global aquí
import { useEffect } from 'react';
import Monitor from "@/components/Monitor";  // Asegúrate de que la ruta sea correcta

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Este hook de efecto asegura que el CSS se cargue correctamente
  }, []);

  return (
    <>
      <Monitor />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
