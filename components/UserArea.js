import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú
    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();

        if (profileData) setUserProfile(profileData);
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
        fetchUsers(); // Fetch users when the component mounts
    }, [fetchUserProfile, fetchUsers]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            router.push('/login'); // Redirigir al login después de cerrar sesión
        }
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/mensaje.png", name: "Mensajes", url: '/bdm' },
        { icon: "https://images.encantia.lat/notas.png", name: "Notas", url: '/notes' },
        { icon: "https://images.encantia.lat/adv.png", name: "Advertencias", url: '/advert' }
    ];

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Texto de "Inicio" encima del navbar, con margen desde la parte superior */}
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
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110"
                    >
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </button>
                )}

                {/* Menú desplegable de opciones */}
                {menuOpen && (
                    <div className="absolute bottom-16 right-0 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-48">
                        <button 
                            onClick={() => router.push(`/profile/${userProfile.user_id}`)}
                            className="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded"
                        >
                            Ver Perfil
                        </button>
                        <button 
                            onClick={handleSignOut}
                            className="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Texto de licencia en la esquina inferior derecha */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
