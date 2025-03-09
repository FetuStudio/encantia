import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function EventsArea() {
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (error) console.error('Error fetching events:', error);
            else setEvents(data);
        };

        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!error) setUserRole(data?.role);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (!profileError) setUserProfile(profileData);
        };

        fetchEvents();
        fetchUserProfile();
    }, []);

    const handleMenuToggle = () => setMenuOpen(!menuOpen);

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-6">
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16" />
                <div className="flex gap-4">
                    <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Inicio</button>
                    <button onClick={() => router.push('/EventsArea')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Eventos</button>
                    <button onClick={() => router.push('/chat')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Chat</button>
                    <button onClick={() => router.push('/libros')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Libros</button>
                    <button onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Discord</button>
                    <button onClick={() => router.push('/fg2')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Fetu Games 2</button>
                    {userRole === 'owner' && <button onClick={() => router.push('/crear-libro')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">Crear Libro</button>}
                    {userProfile && (
                        <div className="relative">
                            <img src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'} alt="Avatar" className="w-10 h-10 rounded-full cursor-pointer" onClick={handleMenuToggle} />
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded-md shadow-lg w-40">
                                    <button onClick={() => router.push('/profile')} className="block px-4 py-2 text-sm hover:bg-gray-700">Perfil</button>
                                    <button onClick={() => router.push('/settings')} className="block px-4 py-2 text-sm hover:bg-gray-700">Configuración</button>
                                    <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-700">Cerrar sesión</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center mt-10">
                <h1 className="text-3xl font-semibold">Eventos Disponibles</h1>
            </div>
            <div className="flex-grow mt-8 space-y-4">
                {events.length === 0 ? (
                    <div className="text-center text-gray-400">No hay eventos disponibles.</div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="bg-gray-800 p-4 rounded-md shadow-md">
                            <h2 className="text-xl font-semibold">{event.name}</h2>
                            <p className="text-sm text-gray-400">{event.date}</p>
                            <p className="mt-2">{event.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

