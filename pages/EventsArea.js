import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [events, setEvents] = useState([]); // Estado para los eventos

    const router = useRouter();

    useEffect(() => {
        // Obtener rol del usuario
        const fetchUserRole = async () => {
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
        };

        // Obtener eventos disponibles
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*'); // Obtén todos los eventos

            if (error) {
                console.error("Error al obtener eventos:", error);
            } else {
                setEvents(data);
            }
        };

        fetchUserRole();
        fetchEvents(); // Llamada para obtener los eventos

    }, []); // Dependencia vacía para que se ejecute solo una vez al cargar el componente

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const navButtons = [
        { name: 'Inicio', url: 'https://www.encantia.lat/' },
        { name: 'Eventos', url: '/EventsArea' },
        { name: 'Libros', url: '/libros' },
        { name: 'Discord', url: 'https://discord.gg/dxcX8S3mrF', target: '_blank' },
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
