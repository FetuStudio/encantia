import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
  const [role, setRole] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
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
    };

    fetchUserProfile();
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
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

        {/* Si el usuario está logueado, muestra la imagen de su avatar */}
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
    </div>
  );
}
