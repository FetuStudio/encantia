import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allProfiles, setAllProfiles] = useState([]);
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

    const fetchAllProfiles = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, name, avatar_url, role');

        if (!error && data) {
            setAllProfiles(data);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchAllProfiles();
    }, [fetchUserProfile, fetchAllProfiles]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) router.push('/');
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
        { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/EventsArea' },
        { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
        { icon: "https://images.encantia.lat/users2.png", name: "Usuarios", url: '/profiles' },
        { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
    ];

    // Agrupar perfiles por rol
    const groupedProfiles = allProfiles.reduce((acc, profile) => {
        const role = profile.role || 'Sin rol';
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(profile);
        return acc;
    }, {});

    return (
        <div className="bg-gray-900 min-h-screen text-white">
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
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full bg-gray-800 hover:scale-110">
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

            {/* Sección de todos los perfiles agrupados por rol */}
            <div className="p-4 mt-0">
                <h2 className="text-xl font-semibold mb-4">Perfiles de usuarios por rol</h2>
                {Object.entries(groupedProfiles).map(([role, profiles]) => (
                    <div key={role} className="mb-6">
                        <h3 className="text-lg font-bold mb-2 capitalize">{role}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {profiles.map(profile => (
                                <div key={profile.user_id} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                                    <img
                                        src={profile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                        alt={profile.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{profile.name}</p>
                                        <button
                                            onClick={() => router.push(`/profile/${profile.user_id}`)}
                                            className="text-sm text-blue-400 hover:underline"
                                        >
                                            Ver perfil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
