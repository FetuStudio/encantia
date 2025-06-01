// pages/api/launcher-login.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const user = data.user;
  const nickname = user.user_metadata?.nickname || email.split('@')[0];

  const profile = {
    accessToken: data.session.access_token,
    clientToken: `client_${user.id}`,
    selectedProfile: {
      id: user.id.replace(/-/g, '').substring(0, 32),
      name: nickname,
    },
  };

  return res.status(200).json(profile);
}
