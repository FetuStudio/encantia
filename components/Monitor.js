import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';  // Asegúrate de que la ruta es correcta

const Monitor = () => {
  const [caidaData, setCaidaData] = useState(null);  // Datos de la caída
  const [pageDisabled, setPageDisabled] = useState(false);  // Estado de la página (si está deshabilitada o no)

  useEffect(() => {
    // Función para consultar el estado de la caída en la base de datos
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
          setCaidaData(null);
          setPageDisabled(false);
        }
      }
    };

    // Llamar a la función inicialmente cuando el componente se monte
    checkCaidaStatus();

    // Configurar un intervalo para verificar el estado de la caída cada 5 segundos
    const intervalId = setInterval(() => {
      checkCaidaStatus();
    }, 5000); // 5000 milisegundos = 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Ejecutar solo una vez cuando el componente se monta

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
