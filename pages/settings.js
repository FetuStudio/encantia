import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://i.ibb.co/d0mWy0kP/perfildef.png');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const [isNameAvailable, setIsNameAvailable] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [profileExists, setProfileExists] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [role, setRole] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();

    // Verifica si el nombre de usuario está disponible
    const checkNameAvailability = async (name) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("name", name)
            .single();
        setIsNameAvailable(!data);  // Si no se encuentra, el nombre está disponible
    };

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
                setProfileExists(true);
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
        if (!name || !avatarUrl) {
            setStatusMessage("El nombre de usuario y la foto de perfil son obligatorios.");
            return;
        }

        setLoading(true);
        setStatusMessage(""); 

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            setStatusMessage("No se pudo obtener el usuario.");
            setLoading(false);
            return;
        }

        if (!userEmail) {
            setStatusMessage("No se pudo obtener el correo electrónico del usuario.");
            setLoading(false);
            return;
        }

        const { data: existingProfile, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("name", name)
            .single();

        if (error || !existingProfile) {
            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    name: name,
                    avatar_url: avatarUrl,
                    email: userEmail,
                });

            setLoading(false);

            if (upsertError) {
                setStatusMessage(upsertError.message);
                return;
            }

            setStatusMessage("Perfil actualizado correctamente.");
            window.location.reload();
        } else {
            setLoading(false);
            setStatusMessage("El nombre de usuario ya está en uso.");
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
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                                onClick={() => router.push('/fg2')}
                            >
                                Fetu Games 2
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

                    {/* Formulario de configuración */}
                    <div className="bg-gray-800 p-6 rounded-lg">
                        {/* Email */}
                        <div>
                            <label className="block text-sm">Email</label>
                            <input
                                type="text"
                                value={email}
                                disabled
                                className="px-4 py-2 text-black rounded w-full bg-gray-700 cursor-not-allowed"
                            />
                        </div>

                        {/* Nombre de Usuario */}
                        <div>
                            <label className="block text-sm">Nombre de Usuario</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    checkNameAvailability(e.target.value);
                                }}
                                className="px-4 py-2 text-black rounded w-full bg-gray-700"
                            />
                            {!isNameAvailable && (
                                <p className="text-red-500 text-sm mt-2">Este nombre de usuario ya está en uso.</p>
                            )}
                        </div>

                        {/* Avatar URL */}
                        <div>
                            <label className="block text-sm">Avatar URL</label>
                            <input
                                type="text"
                                value={avatarUrl === 'https://i.ibb.co/d0mWy0kP/perfildef.png' ? '' : avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="px-4 py-2 text-black rounded w-full bg-gray-700"
                            />
                        </div>

                        {/* Estado de la operación */}
                        {statusMessage && (
                            <div className="text-center text-sm font-semibold mt-4">
                                <p>{statusMessage}</p>
                            </div>
                        )}

                        {/* Botón de guardar cambios */}
                        <button
                            onClick={handleSaveProfile}
                            className="w-full py-2 bg-green-500 rounded-lg hover:bg-green-400 transition-colors"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </>
            ) : (
                <p>Cargando...</p>
            )}
        </div>
    );
}
