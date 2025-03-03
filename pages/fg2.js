import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
    const [event, setEvent] = useState(null);  // Estado para almacenar el evento
    const [timeLeft, setTimeLeft] = useState("");  // Estado para almacenar el tiempo restante
    const router = useRouter(); 

    useEffect(() => {
        const fetchBooks = async () => {
            const { data, error } = await supabase.from("books").select("*");
            if (error) {
                console.error("Error al obtener libros:", error);
            } else {
                setBooks(data);
            }
        };

        const fetchUserRole = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Error al obtener usuario:", authError);
                return;
            }

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error("Error al obtener el rol del usuario:", error);
            } else {
                setRole(data?.role);
            }
        };

        const fetchEvent = async () => {
            const { data, error } = await supabase
                .from("events_fg2")
                .select("*")
                .order("event_date", { ascending: true })
                .limit(1)
                .single();

            if (error) {
                console.error("Error al obtener el evento:", error);
            } else {
                setEvent(data);
                calculateTimeLeft(data?.event_date);
            }
        };

        fetchBooks();
        fetchUserRole();
        fetchEvent();
    }, []);

    const calculateTimeLeft = (eventDate) => {
        const eventTime = new Date(eventDate).getTime();
        const currentTime = new Date().getTime();
        const timeDiff = eventTime - currentTime;

        if (timeDiff <= 0) {
            setTimeLeft("El evento ya ha comenzado o ha pasado");
        } else {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
    };

    return (
        <div className="relative flex flex-col h-screen p-4 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = "https://www.encantia.lat/"}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                    <button
                        onClick={() => router.push('/EventsArea')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Eventos
                    </button>
                    <button
                        onClick={() => router.push('/chat')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Chat
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                        onClick={() => router.push('/libros')}
                    >
                        Libros
                    </button>
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
                    {role === 'owner' && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>
                    )}
                </div>
            </div>

            {/* Mostrar el evento y el contador de tiempo */}
            {event && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Evento: {event.event_name}</h2>
                    <p className="text-xl">Faltan: {timeLeft}</p>
                </div>
            )}

            {/* Mostrar los libros */}
            <div className="mt-4">
                <h3 className="text-xl font-bold mb-4">Libros</h3>
                <ul>
                    {books.map((book) => (
                        <li key={book.id} className="mb-2">{book.title}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
