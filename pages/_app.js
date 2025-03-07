// pages/_app.js
import '../styles/globals.css';  // Importa tu archivo CSS global aquí
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Este hook de efecto asegura que el CSS se cargue correctamente
  }, []);
  
  return <Component {...pageProps} />;

  import Monitor from "@/components/Monitor";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Monitor />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
