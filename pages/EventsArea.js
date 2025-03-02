import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function EventsArea() {
    const [events, setEvents] = useState([]);
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

        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            {/* Barra de navegación */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <img
                        src="https://i.ibb.co/933TjLds/encantia-logo-2025.webp" // Logo
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    {/* Botón de "Inicio" */}
                    <button
                        onClick={() => window.location.href = "https://encantia.lat/"}
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
