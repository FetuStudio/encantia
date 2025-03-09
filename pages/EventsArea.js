import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function EventsArea() {
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null); // Estado para almacenar la URL del avatar
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data);
            }
        };

        const fetchUser = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Error fetching user:', authError);
                return;
            }

            setUser(user);

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching user role:', error);
            } else {
                setUserRole(data?.role);
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching avatar:', profileError);
            } else {
                setAvatarUrl(profileData?.avatar_url);
            }
        };

        fetchEvents();
        fetchUser();
    }, []);

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4 items-center relative">
                    <button onClick={() => window.location.href = "https://www.encantia.lat/"} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Inicio</button>
                    <button onClick={() => router.push('/EventsArea')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Eventos</button>
                    <button onClick={() => router.push('/chat')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Chat</button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors" onClick={() => router.push('/libros')}>Libros</button>
                    <button onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Discord</button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors" onClick={() => router.push('/fg2')}>Fetu Games 2</button>
                    {avatarUrl && (
                        <div className="relative">
                            <img
                                src={avatarUrl}
                                alt="Perfil"
                                className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
                                onClick={handleMenuToggle}
                            />
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
                                    <button onClick={() => router.push('/profile')} className="block px-4 py-2 text-white hover:bg-gray-700 w-full text-left">Perfil</button>
                                    <button onClick={() => router.push('/settings')} className="block px-4 py-2 text-white hover:bg-gray-700 w-full text-left">Configuración</button>
                                    <button onClick={handleLogout} className="block px-4 py-2 text-red-500 hover:bg-gray-700 w-full text-left">Cerrar sesión</button>
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
