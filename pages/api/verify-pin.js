// pages/api/verify-pin.js
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id, pin } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .select('pin')
    .eq('user_id', user_id)
    .single();

  if (error || !data) {
    return res.status(400).json({ message: 'Perfil no encontrado' });
  }

  if (data.pin === pin) {
    return res.status(200).json({ message: 'PIN correcto' });
  } else {
    return res.status(401).json({ message: 'PIN incorrecto' });
  }
}
