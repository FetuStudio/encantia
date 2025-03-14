import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
  const [role, setRole] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, email, name')
        .eq('email', user.email)
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
        setUserEmail(profileData?.email);
        
        if (!profileData.avatar_url || !profileData.name) {
          setProfileExists(false);
        } else {
          setProfileExists(true);
        }
      } else {
        setProfileExists(false);
        setUserEmail(user.email);
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
    setErrorMessage("");

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setErrorMessage("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    if (!userEmail) {
      setErrorMessage("No se pudo obtener el correo electrónico del usuario.");
      setLoading(false);
      return;
    }

    console.log('Email del usuario:', userEmail);

    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", username)
      .single();

    if (error || !existingProfile) {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: username,
          avatar_url: avatarUrl,
          email: userEmail,
        });

      setLoading(false);

      if (upsertError) {
        setErrorMessage(upsertError.message);
        return;
      }

      setProfileSaved(true);
      setErrorMessage("");
      window.location.reload();
    } else {
      setLoading(false);
      setErrorMessage("El nombre de usuario ya está en uso.");
    }
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
      {profileExists ? (
        <>
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
            </div>

            {userProfile && (
              <div className="relative">
                <img
                  src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={toggleMenu}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-4">Crear o Editar Perfil</h2>
        </div>
      )}
    </div>
  );
}
