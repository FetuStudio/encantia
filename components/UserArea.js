import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function CreateProfile() {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setErrorMessage("No se pudo obtener el usuario.");
        return;
      }
      setUserEmail(user.email);  // Guardar el email del usuario
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!username || !avatarUrl) {
      setErrorMessage("El nombre de usuario y la foto de perfil son obligatorios.");
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setErrorMessage("No se pudo obtener el usuario.");
      return;
    }

    // Verificar si el nombre de usuario ya existe
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", username)
      .single();

    if (error || !existingProfile) {
      // Insertar o actualizar el perfil con el nombre de usuario, avatar y email
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: username,
          avatar_url: avatarUrl,
          email: userEmail, // Usar el email del usuario autenticado
        });

      if (upsertError) {
        setErrorMessage(upsertError.message);
        return;
      }

      setProfileSaved(true);
      setErrorMessage("");  // Limpiar mensaje de error si el perfil se guarda correctamente
    } else {
      setErrorMessage("El nombre de usuario ya está en uso.");
    }
  };

  return (
    <div className="p-4">
      {profileSaved ? (
        <p className="text-green-500">¡Perfil guardado con éxito!</p>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-white">Nombre de Usuario</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Escribe tu nombre de usuario"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white">Foto de Perfil (URL)</label>
            <input
              type="url"
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Pega aquí la URL de tu foto"
            />
            {avatarUrl && <img src={avatarUrl} alt="Vista previa" className="mt-2 w-20 h-20 rounded-full" />}
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <button
            onClick={handleSaveProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
          >
            Guardar Perfil
          </button>
        </div>
      )}
    </div>
  );
}
