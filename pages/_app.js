import '../styles/globals.css'; // Importa tus estilos globales
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Importa el hook useRouter
import supabase from '../utils/supabaseClient'; // Importa la configuración de Supabase

function MyApp({ Component, pageProps }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga
  const router = useRouter(); // Usamos el router para redirigir

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        console.log('Fetching maintenance status...');
        const { data, error } = await supabase
          .from('maintenance')
          .select('is_active, reason, start_time')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching maintenance status:', error);
        } else {
          console.log('Fetched data:', data); // Verifica los datos que recibimos
          if (data && data.is_active) {
            setIsMaintenance(true);
            setReason(data.reason || 'Mantenimiento programado');
            setStartTime(data.start_time);

            // Redirige a la página de inicio
            router.push('/');
          } else {
            setIsMaintenance(false);
          }
        }
      } catch (err) {
        console.error('Error during maintenance status fetch:', err);
      } finally {
        setIsLoading(false); // Asegúrate de que la carga siempre termine
      }
    };

    fetchMaintenanceStatus();
  }, [router]); // Asegúrate de que el router esté disponible

  // Mientras se carga el estado de mantenimiento, muestra una pantalla de carga o nada
  if (isLoading) {
    return <div>Loading...</div>; // Esto se puede personalizar o eliminar según tus necesidades
  }

  // Si está en mantenimiento, no renderizamos nada ya que la redirección se realiza en el useEffect
  if (isMaintenance) {
    return null;
  }

  // Si no está en mantenimiento, sigue con el flujo normal
  return <Component {...pageProps} />;
}

export default MyApp;
