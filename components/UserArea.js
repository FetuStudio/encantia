import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
  const [role, setRole] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // Estado para controlar el menú desplegable
  const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false); // Estado para saber si el perfil existe
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error) {
        setRole(data?.role);
      }

      // Obtener perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, email, name')
        .eq('email', user.email) // Verificar por el correo electrónico
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
        setUserEmail(profileData?.email); // Establecer email del perfil
        setProfileExists(true); // El perfil ya existe en la base de datos
      } else {
        setProfileExists(false); // Si no hay perfil, se debe crear uno
        setUserEmail(user.email); // Asignar el email desde la autenticación
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!username || !avatarUrl) {
      setErrorMessage("El nombre de usuario y la foto de perfil son obligatorios.");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Limpiar mensaje de error previo

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setErrorMessage("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    // Verifica si el email está correctamente asignado
    if (!userEmail) {
      setErrorMessage("No se pudo obtener el correo electrónico del usuario.");
      setLoading(false);
      return;
    }

    console.log('Email del usuario:', userEmail); // Verificación del email

    // Verificar si el nombre de usuario ya existe
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", username)
      .single();

    if (error || !existingProfile) {
      // Si no existe el nombre de usuario, proceder a crear o actualizar el perfil
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: username,
          avatar_url: avatarUrl,
          email: userEmail, // Usar el email del usuario autenticado
        });

      setLoading(false);

      if (upsertError) {
        setErrorMessage(upsertError.message);
        return;
      }

      setProfileSaved(true); // Marcar como perfil guardado exitosamente
      setErrorMessage("");  // Limpiar mensaje de error si el perfil se guarda correctamente

      // Recargar la página después de guardar el perfil correctamente
      window.location.reload();
    } else {
      setLoading(false);
      setErrorMessage("El nombre de usuario ya está en uso.");
    }
  };

  // Función para manejar el clic en la foto de perfil y abrir/cerrar el menú
  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
      {/* Solo mostrar la barra de navegación si el perfil existe */}
      {profileExists ? (
        <>
          {/* Barra de navegación superior con "Inicio", "Chat" y "Libros" */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <img
                src="https://images.encantia.lat/encantia-logo-2025.webp"
                alt="Logo"
                className="h-16"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = "https://www.encantia.lat/"}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => router.push('/EventsArea')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
              >
                Eventos
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
              >
                Chat
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                onClick={() => router.push('/libros')}
              >
                Libros
              </button>
              <button
                onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
              >
                Discord
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                onClick={() => router.push('/fg2')}
              >
                Fetu Games 2
              </button>
            </div>

            {/* Foto de perfil en la parte superior derecha */}
            {userProfile && (
              <div className="relative">
                <img
                  src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={toggleMenu} // Al hacer clic en la imagen, toggle el menú
                />

                {/* Menú desplegable */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                    <ul className="py-2">
                      <li
                        className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/settings')}
                      >
                        Configuración
                      </li>
                      <li
                        className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/profile')}
                      >
                        Perfil
                      </li>
                      {/* Cerrar sesión dentro del menú */}
                      <li
                        className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        // Si el perfil no existe, mostrar solo el formulario
        <div className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-4">Crear o Editar Perfil</h2>

          <div className="mb-4">
            <label className="block text-white">Nombre de Usuario</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Escribe tu nombre de usuario"
              required
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
              required
            />
            {avatarUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={avatarUrl}
                  alt="Vista previa"
                  className="w-20 h-20 rounded-full"
                />
              </div>
            )}
          </div>

          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

          <button
            onClick={handleSaveProfile}
            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      )}
    </div>
  );
}

