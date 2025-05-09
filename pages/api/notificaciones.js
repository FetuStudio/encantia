import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { titulo, mensaje, imagen_url } = req.body;

    // Inserta los datos en la tabla 'notificaciones'
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([{ titulo, mensaje, imagen_url, enviado: false }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  }

  // Si el método no es POST
  res.status(405).json({ message: 'Método no permitido' });
}
