import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function PinCheck() {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage('Debes iniciar sesión');
        setUser(null);
      } else {
        setUser(session.user);
      }
    }

    getUser();
  }, []);

  async function checkPin(e) {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('pin')
      .eq('user_id', user.id)
      .single();

    if (error) {
      setMessage('Error al consultar el PIN');
      return;
    }

    if (data.pin === pin) {
      setMessage('PIN correcto. Acceso concedido.');
    } else {
      setMessage('PIN incorrecto');
    }
  }

  return (
    <div>
      <h1>Verifica tu PIN</h1>
      <form onSubmit={checkPin}>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Introduce tu PIN"
          required
        />
        <button type="submit">Verificar PIN</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
