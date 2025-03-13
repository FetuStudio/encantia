import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Navbar() {
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
    const [event, setEvent] = useState(null);  // Estado para almacenar el evento
    const [events, setEvents] = useState([]); // Estado para almacenar la lista de eventos
    const [timeLeft, setTimeLeft] = useState("");  // Estado para almacenar el tiempo restante
    const [showMenu, setShowMenu] = useState(false); // Estado para controlar el menú desplegable
    const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter(); 

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

            // Obtener perfil del usuario
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (!profileError) {
                setUserProfile(profileData);
            }
        };

        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events_fg2').select('*');
            console.log("Eventos obtenidos de events_fg2:", data);  // Verificamos los datos obtenidos de la base de datos

            if (!error && data && data.length > 0) {
                setEvents(data);  // Almacenamos todos los eventos
                const upcomingEvent = data[0];  // Suponiendo que tomamos el primer evento como ejemplo
                setEvent(upcomingEvent);
                calculateTimeLeft(upcomingEvent);
            } else {
                console.log("No se encontraron eventos o hubo un error:", error);
            }
        };

        const calculateTimeLeft = (event) => {
            const eventDate = new Date(event.event_date); // Suponiendo que el campo 'event_date' existe en tu base de datos
            const now = new Date();
            const timeDiff = eventDate - now;

            if (timeDiff > 0) {
                const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));  // Aproximación de meses
                const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));  // Días restantes
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));  // Horas restantes
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));  // Minutos restantes
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);  // Segundos restantes

                setTimeLeft(`${months} meses, ${days} días, ${hours} horas, ${minutes} minutos, ${seconds} segundos`);
            } else {
                setTimeLeft("El evento ha comenzado");
            }
        };

        fetchUserProfile();
        fetchEvents();
    }, []);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const toggleMenu = () => setShowMenu(!showMenu);

    const navButtons = [
        { name: 'Inicio', url: 'https://www.encantia.lat/' },
        { name: 'Eventos', url: '/EventsArea' },
        { name: 'Chat', url: '/chat' },
        { name: 'Libros', url: '/libros' },
        { name: 'Discord', url: 'https://discord.gg/dxcX8S3mrF', target: '_blank' },
        { name: 'Fetu Games 2', url: '/fg2' }
    ];

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            {/* Barra de navegación superior */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    {navButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => window.open(button.url, button.target || "_self")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                        >
                            {button.name}
                        </button>
                    ))}
                </div>

                {/* Foto de perfil */}
                {userProfile && (
                    <div className="relative">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full cursor-pointer"
                            onClick={toggleMenu}
                        />

                        {/* Menú desplegable */}
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

            {/* Modal de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mostrar los eventos */}
            <div className="text-center mt-8">
                <h2 className="text-2xl font-bold mb-2">Eventos Disponibles</h2>
                {events.length > 0 ? (
                    <div>
                        {events.map((event, index) => (
                            <div key={index} className="mb-4">
                                <h3 className="text-xl font-semibold">{event.event_name}</h3>
                                <p>{event.event_description}</p>  {/* Agregar la descripción del evento si es necesario */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay eventos disponibles.</p>
                )}
            </div>

            {/* Mostrar el evento y el contador de tiempo */}
            {event && (
                <div className="text-center mt-8">
                    <h2 className="text-2xl font-bold mb-2">Evento: {event.event_name}</h2>
                    <p className="text-xl">Faltan: {timeLeft}</p>
                </div>
            )}
        </div>
    );
}

