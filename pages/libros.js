import { useEffect, useState } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const router = useRouter(); 

    useEffect(() => { 
        const fetchBooks = async () => { 
            const { data, error } = await supabase.from("books").select("*"); 
            if (error) console.error("Error al obtener libros:", error); 
            else setBooks(data); 
        };

        fetchBooks();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Barra de navegación en la parte superior */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <img
                        src="https://i.ibb.co/933TjLds/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-12"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = "https://encantia.lat/"}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                    <button
                        className="p-2 bg-gray-700 text-white rounded"
                        onClick={() => router.push('/libros')}
                    >
                        Libros
                    </button>
                    <button
                        className="p-2 bg-purple-500 text-white rounded"
                        onClick={() => router.push('/chat')}
                    >
                        Chat
                    </button>
                </div>
            </div>

            <h1 className="text-3xl mb-4">📚 Libros Disponibles</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="bg-gray-800 p-4 rounded-lg cursor-pointer"
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
                ))}
            </div>
        </div>
    );
}
