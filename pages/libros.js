import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
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

        // Función para obtener el rol del usuario
        const fetchUserRole = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error("Error al obtener usuario:", authError);
                return;
            }

            // Obtener el rol del usuario en la tabla 'user_roles'
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id) // Usamos el ID del usuario para obtener su rol
                .single();

            if (error) {
                console.error("Error al obtener el rol del usuario:", error);
            } else {
                setRole(data?.role); // Establecemos el rol del usuario
            }
        };

        fetchBooks();
        fetchUserRole();  // Llamar a la función para obtener el rol del usuario
    }, []);

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
            {/* Barra de navegación superior con "Inicio", "Chat" y "Libros" */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
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

                    {/* Botón de "Discord" */}
                    <button
                        onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
                    >
                        Discord
                    </button>

                    {/* Mostrar botones para "Crear Libro" si el rol es 'owner' */}
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

            <h1 className="text-3xl mb-4">📚 Libros Disponibles</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {books.length === 0 ? (
                    <div className="text-center text-gray-400">
                        No hay libros disponibles.
                    </div>
                ) : (
                    books.map((book) => (
                        <div
                            key={book.id}
                            className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                            <img
                                src={book.cover_url}
                                alt={book.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <h2 className="text-xl font-bold mt-2">{book.title}</h2>
                            <p className="text-gray-400">{book.description}</p>
                            <a href={book.cover_url} target="_blank" className="text-blue-500 mt-2">Ver el libro</a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
