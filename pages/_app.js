import '../styles/globals.css'; // Importa tus estilos globales
import React, { useEffect, useState } from 'react';
import MaintenancePage from './maintenance'; // Importa la página de mantenimiento
import supabase from '../utils/supabaseClient'; // Importa la configuración function MyApp({ Component, pageProps }) {

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('is_active, reason, start_time')
        .eq('id', 1) // Asumiendo que el ID de la fila de mantenimiento es 1
        .single();

      if (error) {
        console.error("Error fetching maintenance status:", error);
      } else {
        if (data.is_active) {
          setIsMaintenance(true);
          setReason(data.reason || 'Mantenimiento programado');
          setStartTime(data.start_time);
        }
      }
    };

    fetchMaintenanceStatus();
  }, []);

  if (isMaintenance) {
    return <MaintenancePage reason={reason} startTime={startTime} />;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
