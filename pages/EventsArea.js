import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function EventsArea() {
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
    const [user, setUser] = useState(null); // Estado para almacenar los datos del usuario
    const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/cerrar el menú
    const router = useRouter();

    useEffect(() => {
        // Función para obtener los eventos
        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data);
            }
        };

        // Función para obtener el rol del usuario y sus datos
        const fetchUser = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Error fetching user:', authError);
                return;
            }

            setUser(user);

            // Buscar el rol del usuario en la tabla 'user_roles'
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id) // Usamos el ID del usuario para obtener su rol
                .single(); // Asumimos que un usuario tiene solo un rol

            if (error) {
                console.error('Error fetching user role:', error);
            } else {
                setUserRole(data?.role); // Establece el rol del usuario
            }
        };

        // Llamar a las funciones cuando el componente se monta
        fetchEvents();
        fetchUser();
    }, []);

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen); // Cambiar el estado para abrir o cerrar el menú
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            {/* Barra de navegación */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp" // Logo
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    {/* Botón de "Inicio" */}
                    <button
                        onClick={() => window.location.href = "https://www.encantia.lat/"}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>

                    {/* Botón de "Eventos" */}
                    <button
                        onClick={() => router.push('/EventsArea')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Eventos
                    </button>

                    {/* Botón de "Chat" */}
                    <button
                        onClick={() => router.push('/chat')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Chat
                    </button>

                    {/* Botón de "Libros" */}
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                        onClick={() => router.push('/libros')}
                    >
                        Libros
                    </button>

                    {/* Botón de "Discord" */}
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

                    {/* Botón de "Crear Libro" visible solo para los usuarios con rol "owner" */}
                    {userRole === 'owner' && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>
                    )}
                </div>
            </div>

            {/* Título de los eventos */}
            <div className="text-center mt-10">
                <h1 className="text-3xl font-semibold">Eventos Disponibles</h1>
            </div>

            {/* Contenedor de eventos */}
            <div className="flex-grow mt-8 space-y-4">
                {events.length === 0 ? (
                    <div className="text-center text-gray-400">
                        No hay eventos disponibles.
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-gray-800 p-4 rounded-md shadow-md"
                        >
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
