import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';  // Asegúrate de que la ruta es correcta

const Monitor = () => {
  const [caidaData, setCaidaData] = useState(null);  // Datos de la caída
  const [pageDisabled, setPageDisabled] = useState(false);  // Estado de la página (si está deshabilitada o no)

  useEffect(() => {
    // Función para verificar si hay una caída
    const checkCaidaStatus = async () => {
      const { data, error } = await supabase
        .from('caida')
        .select('*')
        .eq('EOD', 'True') // Verifica si hay caídas con EOD = 'True'
        .single(); // Solo esperamos un solo resultado

      if (error) {
        console.error('Error al obtener datos de caida:', error);
      } else {
        // Si encontramos una caída, deshabilitamos la página
        if (data) {
          setCaidaData(data);
          setPageDisabled(true);
        } else {
          // Si no hay caídas, la página sigue funcionando normalmente
          setPageDisabled(false);
        }
      }
    };

    // Llama a la función cuando el componente se monte
    checkCaidaStatus();

    // Suscripción en tiempo real para actualizaciones
    const subscription = supabase
      .from('caida')
      .on('UPDATE', (payload) => {
        if (payload.new.EOD === 'True') {
          setCaidaData(payload.new);  // Actualiza los datos de la caída
          setPageDisabled(true);  // Deshabilita la página si EOD es True
        } else {
          setCaidaData(null);  // Resetea los datos de la caída
          setPageDisabled(false);  // Habilita la página si EOD no es True
        }
      })
      .subscribe();

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // Si la página está deshabilitada, muestra el motivo de la caída
  if (pageDisabled && caidaData) {
    return (
      <div>
        <h1>Motivo de la Caída</h1>
        <p><strong>Título:</strong> {caidaData.Titulo}</p>
        <p><strong>Motivo:</strong> {caidaData.Motivo}</p>
        <p><strong>Hora de Caída:</strong> {new Date(caidaData.hora_de_caida).toLocaleString()}</p>
      </div>
    );
  }

  // Si la página no está deshabilitada, muestra el contenido normal
  return (
    <div>
      <h1>Bienvenido a la página normal</h1>
      <p>La página está funcionando correctamente.</p>
    </div>
  );
};

export default Monitor;
