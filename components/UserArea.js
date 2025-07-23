import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProfileExisting, setIsProfileExisting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) setUserProfile(profileData);
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error) setUsers(data);
  }, []);

  const fetchAlertMessage = useCallback(async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setAlertMessage({ message: data.message, type: data.type });
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUsers();
    fetchAlertMessage();
  }, [fetchUserProfile, fetchUsers, fetchAlertMessage]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      setErrorMessage("Error al subir la imagen.");
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrlData.publicUrl);
  };

  const handleProfileSubmit = async () => {
    setErrorMessage("");
    setIsProfileExisting(false);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage("No se pudo obtener el usuario.");
      return;
    }

    const existingUser = users.find(u => u.name.toLowerCase() === nickname.toLowerCase());
    if (existingUser) {
      setIsProfileExisting(true);
      return;
    }

    const newProfile = {
      user_id: user.id,
      name: nickname,
      avatar_url: avatarUrl,
      email: user.email,
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert([newProfile], { onConflict: ['user_id'] });

    if (!upsertError) {
      setUserProfile(newProfile);
      router.push('/');
    } else {
      setErrorMessage(upsertError.message);
    }
  };

  const navButtons = [
    { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
    { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
    { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/events' },
    { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
    { icon: "https://images.encantia.lat/users2.png", name: "Usuarios", url: '/profiles' },
    { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
  ];

  const renderAlert = () => (
    alertMessage && (
      <div className={`flex items-start sm:items-center justify-center gap-3 px-4 py-3 text-sm font-medium w-full z-50 ${
        alertMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
        alertMessage.type === 'success' ? 'bg-green-100 text-green-800' :
        alertMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
        alertMessage.type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
          {/* ...icon paths como antes... */}
        </svg>
        <div className="text-left max-w-3xl">{alertMessage.message}</div>
      </div>
    )
  );

  if (!userProfile) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center">
        {renderAlert()}
        <div className="text-white font-bold text-lg mt-8 mb-4">¡Hola! Completa tu perfil</div>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="p-2 mb-4 text-white bg-gray-800 placeholder-gray-400 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="p-2 mb-4 text-white bg-gray-800 rounded"
        />
        <button onClick={handleProfileSubmit} className="p-2 bg-blue-500 text-white rounded">Guardar perfil</button>
        {isProfileExisting && <div className="text-red-500 mt-2">Este nombre ya está en uso.</div>}
        {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {renderAlert()}

      {/* Navegación inferior */}
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
        <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-13 w-auto" />
        {navButtons.map((button, index) => (
          <div key={index} className="relative group">
            <button onClick={() => router.push(button.url)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110">
              <img src={button.icon} alt={button.name} className="w-8 h-8" />
            </button>
            <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">{button.name}</span>
          </div>
        ))}
        {userProfile && (
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full bg-gray-800 text-white text-xl hover:scale-110 transition-transform">
              <img src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'} alt="Avatar" className="w-8 h-8 rounded-full" />
            </button>
            {isDropdownOpen && (
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                <button onClick={() => router.push(`/account`)} className="w-full text-left px-4 py-2 hover:bg-gray-700">Configuración</button>
                <button onClick={() => router.push(`/profile/${userProfile.user_id}`)} className="w-full text-left px-4 py-2 hover:bg-gray-700">Ver mi perfil</button>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700">Cerrar sesión</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
        © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
      </div>
    </div>
  );
}

