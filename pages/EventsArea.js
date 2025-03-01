import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function EventsArea() {
    const [events, setEvents] = useState([]);

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
