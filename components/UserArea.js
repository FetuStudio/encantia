import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Adsense from "../components/Adsense";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isProfileExisting, setIsProfileExisting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileData) {
            setUserProfile(profileData);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchUsers();
    }, [fetchUserProfile, fetchUsers]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            router.push('/');
        }
    };

    const handleProfileSubmit = async () => {
        setErrorMessage("");
        setIsProfileExisting(false);

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("❌ No se pudo obtener el usuario", userError);
            setErrorMessage("No se pudo obtener el usuario. Intenta iniciar sesión nuevamente.");
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

        if (upsertError) {
            setErrorMessage(`Error: ${upsertError.message}`);
            return;
        }

        setUserProfile(newProfile);
        router.push('/');
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
        { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/EventsArea' },
        { icon: "https://images.encantia.lat/luminus-s.png", name: "Luminus Studios", url: '/luminus' },
        { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
        { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
    ];

    if (!userProfile) {
        return (
            <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center">
                <div className="text-white font-bold text-lg mb-4">¡Hola! Completa tu perfil</div>

                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="p-2 mb-4 text-black rounded"
                />
                <input
                    type="text"
                    placeholder="URL de tu foto de perfil"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="p-2 mb-4 text-black rounded"
                />
                <button
                    onClick={handleProfileSubmit}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Guardar perfil
                </button>

                {isProfileExisting && (
                    <div className="text-red-500 mt-2">Este nombre de usuario ya está en uso. Por favor, elige otro.</div>
                )}

                {errorMessage && (
                    <div className="text-red-500 mt-2">{errorMessage}</div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* NUEVO BLOQUE: Solicita un Código de Creador */}
            <div className="flex flex-col items-center justify-center text-center py-10">
                <h1 className="text-white text-2xl font-bold mb-4">
                    ¡Solicita ahora un Código de Creador!
                </h1>
                <a
                    href="https://www.encantia.lat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition"
                >
                    Solicitar ahora
                </a>
                <a
                    href="https://cco.encantia.lat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                    Revisa si cumples los requisitos para solicitar un Código de Creador
                </a>
            </div>

            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Inicio
            </div>

            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
                <img
                    src="https://images.encantia.lat/encantia-logo-2025.webp"
                    alt="Logo"
                    className="h-13 w-auto"
                />

                {navButtons.map((button, index) => (
                    <div key={index} className="relative group">
                        <button
                            onClick={() => router.push(button.url)}
                            className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                        >
                            <img src={button.icon} alt={button.name} className="w-8 h-8" />
                        </button>
                        <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                            {button.name}
                        </span>
                    </div>
                ))}

                {userProfile && (
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110">
                            <img
                                src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                                <button
                                    onClick={() => router.push(`/profile/${userProfile.user_id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                >
                                    Ver mi perfil
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                                >
                                    Cerrar sesión
                                </button>
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

