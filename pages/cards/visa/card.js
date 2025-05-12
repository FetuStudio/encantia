import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "./../../../utils/supabaseClient";
import React from "react";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Para controlar el menú desplegable
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

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
        { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/EventsArea' },
        { icon: "https://images.encantia.lat/luminus-s.png", name: "Luminus Studios", url: '/luminus' },
        { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
        { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
    ];

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Imagen centrada en la parte superior */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 flex flex-col items-center">
                <img
                    src="https://logos-world.net/wp-content/uploads/2020/05/Visa-Logo-700x394.png"
                    alt="Logo Central"
                    className="h-10 w-auto"
                />
                <div className="text-white text-center mt-3 text-lg font-semibold">
                    Tarjeta de Débito Visa Encantia
                </div>
                <div className="text-red-600 text-center mt-3 text-lg font-semibold">
                    EN DESARROLLO
                </div>
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

                        {/* Menú desplegable encima de la foto */}
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
        </div>
    );
}
