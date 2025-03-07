// pages/index.js
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Ajusta la importación a supabaseClient.js
import Monitor from '../components/Monitor'; // Componente Monitor

export default function Home() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [caidaData, setCaidaData] = useState(null);

  useEffect(() => {
    // Esta función se ejecuta cuando se carga la página
    const fetchCaida = async () => {
      const { data, error } = await supabase
        .from('caida')
        .select('*')
        .eq('EOD', 'True') // Filtra por EOD = 'True'
        .single(); // Asegúrate de que solo haya un registro

      if (error) {
        console.error('Error al obtener datos de caida:', error);
      } else {
        if (data) {
          setCaidaData(data);
          setIsDisabled(true); // Deshabilitar la página si EOD es True
        }
      }
    };

    fetchCaida();

    // Suscripción en tiempo real para escuchar cambios
    const subscription = supabase
      .from('caida')
      .on('UPDATE', (payload) => {
        if (payload.new.EOD === 'True') {
          setCaidaData(payload.new);
          setIsDisabled(true); // Actualiza el estado a True cuando se detecta un cambio
        } else {
          setIsDisabled(false); // Si vuelve a False, habilita la página
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription); // Limpiar la suscripción cuando el componente se desmonte
    };
  }, []);

  // Si la página está caída, mostramos el componente Monitor
  if (isDisabled && caidaData) {
    return <Monitor titulo={caidaData.Titulo} motivo={caidaData.Motivo} horaDeCaida={caidaData.hora_de_caida} />;
  }

  return (
    <div>
      {/* Si la página no está caída, muestra el contenido normal */}
      <h1>Bienvenido a la página principal</h1>
      <p>Contenido de la página</p>
    </div>
  );
}
