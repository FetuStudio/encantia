import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Correo y contraseña son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      router.push('/');
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    let options = {
      redirectTo: window.location.origin,
    };

    // 👇 WorkOS requiere connection_id
    if (provider === 'workos') {
      options.queryParams = {
        connection: '<TU_CONNECTION_ID>', // <-- cámbialo por el de tu WorkOS Dashboard
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options,
    });

    if (error) setErrorMessage(error.message);
  };

  return (
    <div className="bg-gray-900 h-screen flex items-center justify-center relative">
      {errorMessage && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-black p-3 rounded shadow-lg flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            className="ml-4 font-bold hover:bg-gray-300 px-2 rounded"
            onClick={() => setErrorMessage(null)}
          >
            X
          </button>
        </div>
      )}

      <div className="max-w-sm w-full border border-gray-700 rounded p-6 bg-gray-800">
        <div className="flex justify-center mb-4">
          <img
            src="https://images.encantia.lat/encantia-logo-2025.webp"
            alt="Logo de Encatia"
            className="h-25"
          />
        </div>

        <h1 className="text-center text-white text-2xl">
          {isSignUp ? "Registrarse" : "Iniciar sesión"}
        </h1>

        <div className="field mt-4">
          <label htmlFor="email" className="text-white block text-sm">Correo electrónico</label>
          <div className="flex items-center">
            <input
              type="email"
              className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Correo electrónico"
            />
            <img src="https://images.encantia.lat/email.png" alt="Correo" className="w-6 h-6 ml-2" />
          </div>
        </div>

        <div className="field mt-4">
          <label htmlFor="password" className="text-white block text-sm">Contraseña</label>
          <div className="flex items-center">
            <input
              type={passwordVisible ? "text" : "password"}
              className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Contraseña"
            />
            <img src="https://images.encantia.lat/password.png" alt="Contraseña" className="w-6 h-6 ml-2" />
            <button
              type="button"
              className="ml-2 text-white"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              <img
                src={passwordVisible ? "https://images.encantia.lat/upass.png" : "https://images.encantia.lat/vpass.png"}
                alt={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="w-6 h-6"
              />
            </button>
          </div>
        </div>

        <button
          className="border p-2 w-full mt-5 rounded bg-blue-600 text-white flex justify-center items-center relative"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <img
              src="https://images.encantia.lat/loading.gif"
              alt="Cargando..."
              className="w-6 h-6"
            />
          ) : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
        </button>

        {/* 🔑 Proveedores OAuth */}
        <div className="mt-6 flex justify-center space-x-4">
          {['github', 'discord', 'gitlab', 'google', 'spotify', 'workos'].map((provider) => (
            <button
              key={provider}
              onClick={() => handleOAuthLogin(provider)}
              className="p-2 rounded flex items-center justify-center gap-2 text-lg"
            >
              <img
                src={
                  provider === 'github'
                    ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                    : provider === 'discord'
                    ? "https://th.bing.com/th/id/R.18caff5f9c259a9ba08aa5de464e217a?rik=3LUHiVA9UTofuA&pid=ImgRaw&r=0"
                    : provider === 'gitlab'
                    ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg"
                    : provider === 'google'
                    ? "https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-1024.png"
                    : provider === 'spotify'
                    ? "https://logospng.org/download/spotify/logo-spotify-icon-4096.png"
                    : "https://avatars.githubusercontent.com/u/5955810?s=280&v=4" // 🔑 Icono WorkOS
                }
                alt={provider}
                className="w-8 h-8"
              />
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-white text-sm">
            {isSignUp ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 hover:underline"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs flex items-center gap-1">
        <span className="text-white">Powered by</span>
        <span className="bg-green-400 py-1 px-2 rounded-xl">Encantia</span>
      </div>
    </div>
  );
}

