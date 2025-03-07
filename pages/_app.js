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
        
        // Solicita el estado de mantenimiento a Supabase
        const { data, error } = await supabase
          .from('maintenance')
          .select('is_active, reason, start_time')
          .eq('id', 1) // Asumiendo que el ID de la fila de mantenimiento es 1
          .single();

        // Verifica si hubo un error al obtener los datos
        if (error) {
          console.error('Error fetching maintenance status:', error);
        } else {
          // Log de datos obtenidos
          console.log('Fetched data:', data);

          // Verifica si los datos están correctos y si `is_active` es true
          if (data && data.is_active === true) {
            console.log('Maintenance is active, redirecting to home...');
            setIsMaintenance(true); // Cambia el estado a mantenimiento
            setReason(data.reason || 'Mantenimiento programado');
            setStartTime(data.start_time);
            
            // Redirige a la página de inicio
            router.push('/');
          } else {
            console.log('Maintenance is not active.');
            setIsMaintenance(false);
          }
        }
      } catch (err) {
        console.error('Error during maintenance status fetch:', err);
      } finally {
        // Cambia el estado de carga para que deje de mostrar "Loading..."
        setIsLoading(false);
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
    return null; // No hacemos render en la página de mantenimiento
  }

  // Si no está en mantenimiento, sigue con el flujo normal
  return <Component {...pageProps} />;
}

export default MyApp;
