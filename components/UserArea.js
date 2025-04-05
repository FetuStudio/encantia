import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); // Estado para mostrar mensajes de error
    const [isProfileExisting, setIsProfileExisting] = useState(false); // Estado para saber si el nickname ya existe
    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id) // Comprobamos por user_id
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
            setUsers(data); // Set users data here
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchUsers(); // Fetch users when the component mounts
    }, [fetchUserProfile, fetchUsers]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            router.push('/'); // Redirigir al login después de cerrar sesión
        }
    };

    const handleProfileSubmit = async () => {
        // Verificar si el nickname ya existe
        const existingUser = users.find(user => user.name.toLowerCase() === nickname.toLowerCase());
        if (existingUser) {
            setIsProfileExisting(true);
            return;
        }

        // Si no existe, crear el perfil
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { error: insertError } = await supabase
            .from('profiles')
            .insert([
                {
                    user_id: user.id,
                    name: nickname,
                    avatar_url: avatarUrl,
                    email: user.email,
                },
            ]);

        if (insertError) {
            console.error('Error creating profile:', insertError);
        } else {
            setUserProfile({ user_id: user.id, name: nickname, avatar_url: avatarUrl });
        }
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/bdm' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' }
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
            {/* Texto de "Inicio" encima del navbar */}
            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Inicio
            </div>

            {/* Navbar de abajo */}
            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
                {/* Logo a la izquierda en el navbar inferior */}
                <img
                    src="https://images.encantia.lat/encantia-logo-2025.webp"
                    alt="Logo"
                    className="h-13 w-auto"
                />

                {/* Botones de navegación */}
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

                {/* Avatar del usuario */}
                {userProfile && (
                    <button onClick={() => router.push(`/profile/${userProfile.user_id}`)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </button>
                )}
            </div>

            {/* Texto de licencia en la esquina inferior derecha */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}

