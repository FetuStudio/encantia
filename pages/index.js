import Head from "next/head";
import Auth from "../components/Auth";
import UserArea from "../components/UserArea";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  // Usamos `useState` correctamente para manejar el estado de la sesión
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Establecer la sesión inicial
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession(); // Cambié a `getSession`
      setSession(sessionData);
    };

    fetchSession(); // Llamamos la función para obtener la sesión

    // Suscripción a cambios de estado de autenticación
    const { data: authListener, error } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      setSession(session);
    });

    // Comprobamos si el listener fue correctamente asignado
    if (authListener && typeof authListener.unsubscribe === 'function') {
      // Limpiar la suscripción cuando el componente se desmonte
      return () => {
        authListener.unsubscribe();
      };
    } else {
      console.error('Error: El listener de autenticación no tiene unsubscribe.');
    }

  }, []);

  return (
    <div className={styles.container}> {/* Usamos el CSS Module aquí */}
      <Head>
        <title>Encantia</title>
        <meta name="description" content="Web oficial de Encantia" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? <UserArea /> : <Auth />}
    </div>
  );
}
