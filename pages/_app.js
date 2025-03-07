import '../styles/globals.css'; // Importa tus estilos globales
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Importa el hook useRouter
import supabase from '../utils/supabaseClient'; // Importa la configuración de Supabase

function MyApp({ Component, pageProps }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const router = useRouter(); // Usamos el router para redirigir
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('is_active, reason, start_time')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching maintenance status:', error);
      } else {
        if (data.is_active) {
          // Si el mantenimiento está activo, redirigir a la página de inicio
          setIsMaintenance(true);
          setReason(data.reason || 'Mantenimiento programado');
          setStartTime(data.start_time);
          router.push('/'); // Redirigir a la página de inicio
        } else {
          setIsMaintenance(false); // Si no está en mantenimiento, todo normal
        }
      }
      setIsLoading(false); // Termina la carga
    };

    fetchMaintenanceStatus();
  }, [router]); // Asegúrate de que el router esté disponible en el useEffect

  // Mientras se carga el estado de mantenimiento, muestra una pantalla de carga o nada
  if (isLoading) {
    return <div>Loading...</div>; // Esto se puede personalizar o eliminar según tus necesidades
  }

  if (isMaintenance) {
    // Si está en mantenimiento, redirige al usuario a la página de inicio
    return <></>; // No renderizamos nada ya que la redirección se realiza en el useEffect
  }

  // Si no está en mantenimiento, sigue con el flujo normal
  return <Component {...pageProps} />;
}

export default MyApp;

