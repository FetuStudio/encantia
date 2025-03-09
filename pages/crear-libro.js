import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function CrearLibros() {
    const [books, setBooks] = useState([]);
    const [role, setRole] = useState("");  // Estado para el rol del usuario
    const router = useRouter();

    useEffect(() => {
        fetchBooks();
        fetchUserRole();
    }, []);

    const fetchBooks = async () => {
        const { data, error } = await supabase.from("books").select("*");
        if (!error) setBooks(data);
        else console.error("Error al obtener libros:", error);
    };

    const fetchUserRole = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }

        // Obtenemos el rol del usuario desde la tabla user_roles
        const { data, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleError) {
            console.error('Error fetching role:', roleError);
            return;
        }

        setRole(data?.role);  // Asignamos el rol del usuario
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este libro?")) {
            const { data, error } = await supabase.from("books").delete().eq("id", id);
            if (!error) {
                alert("Libro eliminado con éxito!");
                fetchBooks(); // Actualiza la lista de libros después de eliminarlo
            } else {
                console.error("Error al eliminar el libro:", error.message);
                alert("Hubo un error al eliminar el libro: " + error.message);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4">

            {/* Barra de navegación */}
            <div className="flex justify-between items-center mb-4 w-full">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/libros')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Libros
                    </button>

                    {/* Botón de crear libro solo si es owner */}
                    {role === 'owner' ? (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>
                    ) : (
                        <p className="text-red-500">No tienes permisos para crear libros.</p>
                    )}
                </div>
            </div>

            {/* Lista de libros */}
            <div className="flex flex-col items-center justify-center p-4 mt-8 w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-4">Mis Libros</h1>

                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} className="flex flex-col items-center bg-gray-800 p-4 rounded-lg mb-4 w-full">
                            <h2 className="text-xl font-bold">{book.title}</h2>
                            <p className="text-gray-400">{book.description}</p>
                            <div className="flex gap-4 mt-2">
                                <button 
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
                                    onClick={() => handleDeleteBook(book.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No tienes libros disponibles.</p>
                )}
            </div>
        </div>
    );
}
