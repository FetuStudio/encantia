import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';  // Importa el cliente de Supabase

export default function Notificaciones() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enviar los datos del formulario a la API
    const response = await fetch('/api/notificaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titulo, mensaje, imagen_url: imagenUrl }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Notificación enviada correctamente');
      setTitulo('');
      setMensaje('');
      setImagenUrl('');
    } else {
      alert('Error: ' + data.error);
    }
  };

  return (
    <div>
      <h1>Enviar Notificación</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="titulo">Título:</label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="mensaje">Mensaje:</label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="imagen_url">URL de la Imagen (opcional):</label>
          <input
            type="text"
            id="imagen_url"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
          />
        </div>

        <button type="submit">Enviar Notificación</button>
      </form>
    </div>
  );
}
