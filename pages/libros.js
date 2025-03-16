import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
    const router = useRouter(); 

    useEffect(() => {
        // Obtener los libros disponibles de la base de datos
        const fetchBooks = async () => {
            const { data, error } = await supabase
                .from('books')  // Cambiar el nombre de la tabla si es necesario
                .select('*');   // Seleccionar todas las columnas, puedes personalizar si es necesario
            
            if (error) {
                console.error("Error al obtener los libros:", error.message);
            } else {
                setBooks(data); // Actualiza el estado con los libros
            }
        };

        fetchBooks(); // Llamada para obtener los libros cuando se carga el componente

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
        };

        fetchUserProfile();
    }, []);

    // Función para verificar si una URL es válida
    const isValidImageUrl = (url) => {
        return url && (url.startsWith("http://") || url.startsWith("https://"));
    };

    // Función para manejar errores de imagen
    const handleImageError = (e) => {
        e.target.onerror = null; // Evita que se entre en un bucle si no se puede cargar la imagen
        e.target.src = "https://www.w3schools.com/w3images/fjords.jpg"; // Imagen predeterminada
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
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
                            {/* Mostrar la imagen de la portada desde portada_url */}
                            {isValidImageUrl(book.portada_url) ? (
                                <div className="relative w-full h-64 bg-gray-500 rounded-lg overflow-hidden">
                                    <img
                                        src={book.portada_url}
                                        alt={book.title}
                                        className="w-full h-full object-contain rounded-lg"
                                        onError={handleImageError} // En caso de error, se cambia la imagen por una predeterminada
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-64 bg-gray-500 rounded-lg flex items-center justify-center text-white">
                                    {book.portada_url ? "Portada no válida" : "Sin portada"}
                                </div>
                            )}
                            <h2 className="text-xl font-bold mt-2">{book.title}</h2>
                            <p className="text-gray-400">{book.description}</p>
                            {/* Enlace corregido a cover_url */}
                            {isValidImageUrl(book.cover_url) && (
                                <a href={book.cover_url} target="_blank" className="text-blue-500 mt-2">Ver el libro</a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
