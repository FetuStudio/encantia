import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
    const [userProfile, setUserProfile] = useState(null); // Estado para almacenar el perfil del usuario
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Para controlar el menú desplegable
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

        // Obtener el perfil del usuario logueado
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!error) {
                setUserProfile(data);
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

    // Función para cerrar sesión
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            {/* Título */}
            <h1 className="text-3xl mb-4">📚 Libros Disponibles</h1>

            {/* Grid de libros */}
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

            {/* Barra de navegación inferior */}
            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
                <img
                    src="https://images.encantia.lat/encantia-logo-2025.webp"
                    alt="Logo"
                    className="h-13 w-auto"
                />

                {/* Botones de la barra de navegación inferior */}
                <div className="relative group">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/home.png" alt="Inicio" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Inicio
                    </span>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => router.push('/libros')}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/libros.png" alt="Libros" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Libros
                    </span>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => router.push('/EventsArea')}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/eventos.png" alt="Eventos" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Eventos
                    </span>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => router.push('/luminus')}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/luminus-s.png" alt="Luminus" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Luminus Studios
                    </span>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => router.push('/music')}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/music.png" alt="Luminus" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Musica
                    </span>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                    >
                        <img src="https://images.encantia.lat/discord.png" alt="Discord" className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Discord
                    </span>
                </div>

                {/* Menú de perfil */}
                {userProfile && (
                    <div className="relative group">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110"
                        >
                            <img
                                src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        </button>

                        {/* Menú desplegable */}
                        {isDropdownOpen && (
                            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                                <button
                                    onClick={() => router.push(`/profile/${userProfile.user_id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                >
                                    Ver mi perfil
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pie de página */}
            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
