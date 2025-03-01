import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function CreateEvent() {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [events, setEvents] = useState([]);
    const [role, setRole] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }

            if (user) {
                const { data, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                if (roleError) {
                    console.error('Error fetching role:', roleError);
                    return;
                }

                setRole(data?.role); 
            }
        };

        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data);
            }
        };

        fetchUserProfile();
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase
            .from('events')
            .insert([
                {
                    name: eventName,
                    date: eventDate,
                    description: eventDescription,
                },
            ]);

        if (error) {
            alert('Error creating event: ' + error.message);
        } else {
            router.push('/'); 
        }
    };

    const handleDeleteEvent = async (eventId) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            alert('Error deleting event: ' + error.message);
        } else {
            setEvents(events.filter((event) => event.id !== eventId));
        }
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            <div className="flex flex-col items-center justify-center space-y-6">
                {/* Título y formulario */}
                <h1 className="text-3xl font-semibold mb-4">Crear Evento</h1>
                <form onSubmit={handleCreateEvent} className="w-full max-w-md space-y-4 mb-8">
                    <input
                        type="text"
                        placeholder="Nombre del Evento"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="datetime-local"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                        placeholder="Descripción del Evento"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-all"
                    >
                        Crear Evento
                    </button>
                </form>

                {/* Mostrar los eventos creados */}
                <div className="w-full max-w-md space-y-4">
                    <h2 className="text-xl font-semibold">Eventos Actuales</h2>
                    {events.length === 0 ? (
                        <div className="text-center text-gray-400">No hay eventos disponibles.</div>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-gray-800 p-4 rounded-md shadow-md"
                            >
                                <h3 className="text-lg font-semibold">{event.name}</h3>
                                <p className="text-sm text-gray-400">{event.date}</p>
                                <p className="mt-2">{event.description}</p>
                                {/* Solo los admins pueden eliminar eventos */}
                                {role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="mt-2 text-red-600 hover:text-red-800"
                                    >
                                        Eliminar Evento
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
