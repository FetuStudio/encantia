import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function CrearLibros() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverUrl, setCoverUrl] = useState("");  // Para el link de la portada
    const [chapters, setChapters] = useState([{ number: 1, content: "" }]);
    const [books, setBooks] = useState([]);
    const [isLinkMode, setIsLinkMode] = useState(false); // Para cambiar entre crear libro y usar link
    const [bookLink, setBookLink] = useState(""); // Para el link del libro
    const [bookTitle, setBookTitle] = useState(""); // Para el título del libro
    const router = useRouter();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const { data, error } = await supabase.from("books").select("*");
        if (!error) setBooks(data);
        else console.error("Error al obtener libros:", error);
    };

    const handleAddChapter = () => {
        setChapters([...chapters, { number: chapters.length + 1, content: "" }]);
    };

    const handleChapterChange = (index, newContent) => {
        const newChapters = [...chapters];
        newChapters[index].content = newContent;
        setChapters(newChapters);
    };

    const handleCreateBook = async () => {
        // Verificamos que todos los campos estén llenos
        if (!title || !description || !coverUrl || chapters.some(chap => !chap.content)) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        // Intentamos insertar el libro en la base de datos
        const { data, error } = await supabase.from("books").insert([{
            title,
            description,
            cover_url: coverUrl  // Solo el título, descripción y cover_url
        }]);

        if (error) {
            console.error("Error al crear el libro:", error.message); // Muestra el mensaje de error específico
            alert("Hubo un problema al guardar el libro: " + error.message); // Muestra el mensaje de error
            return;
        }

        alert("Libro creado con éxito!");
        setTitle("");
        setDescription("");
        setCoverUrl("");
        setChapters([{ number: 1, content: "" }]);
        fetchBooks(); // Actualizamos la lista de libros después de crear uno nuevo
    };

    const handleLinkSubmit = async () => {
        if (!bookLink || !bookTitle) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const { data, error } = await supabase.from("books").insert([{
            title: bookTitle,
            description: "No disponible",  // Puedes dejar esto vacío si lo prefieres
            cover_url: bookLink  // Guardamos solo el link del libro
        }]);

        if (error) {
            console.error("Error al agregar el libro con el link:", error.message);
            alert("Hubo un problema al agregar el libro: " + error.message);
            return;
        }

        alert("Libro agregado con éxito!");
        setBookLink("");
        setBookTitle("");
        fetchBooks(); // Actualizamos la lista de libros
    };

    const handleDeleteBook = async (id) => {
        const { data, error } = await supabase.from("books").delete().eq("id", id);
        if (!error) fetchBooks();
        else console.error("Error al eliminar el libro:", error.message);
    };

    return (
         <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
            {/* Barra de navegación superior con "Inicio", "Chat" y "Libros" */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://i.ibb.co/933TjLds/encantia-logo-2025.webp"
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

                    {role === 'owner' && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>

                    {(role === 'owner' || role === 'admin') && (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Evento
                        </button>
                     
                    )}
                </div>
            </div>

            {/* Crear libro */}
            <div className="flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Crear Libro</h1>

                {!isLinkMode ? (
                    <>
                        <input 
                            className="p-2 mb-2 w-full max-w-md bg-gray-800 border border-gray-700 rounded"
                            placeholder="Título"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <input 
                            className="p-2 mb-2 w-full max-w-md bg-gray-800 border border-gray-700 rounded"
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input 
                            className="p-2 mb-2 w-full max-w-md bg-gray-800 border border-gray-700 rounded"
                            placeholder="URL de la portada"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                        />

                        <h2 className="text-lg font-bold mt-4">Capítulos</h2>
                        {chapters.map((chap, index) => (
                            <div key={index} className="mb-2 w-full max-w-md">
                                <label className="block text-sm mb-1">Capítulo {chap.number}</label>
                                <textarea
                                    className="p-2 w-full h-20 bg-gray-800 border border-gray-700 rounded"
                                    placeholder={`Contenido del capítulo ${chap.number}`}
                                    value={chap.content}
                                    onChange={(e) => handleChapterChange(index, e.target.value)}
                                />
                            </div>
                        ))}
                        <button 
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded mb-4"
                            onClick={handleAddChapter}
                        >
                            + Agregar Capítulo
                        </button>

                        <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                            onClick={handleCreateBook}
                        >
                            Guardar Libro
                        </button>
                    </>
                ) : (
                    <>
                        <input 
                            className="p-2 mb-2 w-full max-w-md bg-gray-800 border border-gray-700 rounded"
                            placeholder="Link del libro"
                            value={bookLink}
                            onChange={(e) => setBookLink(e.target.value)}
                        />
                        <input 
                            className="p-2 mb-2 w-full max-w-md bg-gray-800 border border-gray-700 rounded"
                            placeholder="Título del libro"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                        />
                        <button className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                            onClick={handleLinkSubmit}
                        >
                            Subir Libro
                        </button>
                    </>
                )}

                <button 
                    className="mt-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    onClick={() => setIsLinkMode(!isLinkMode)}
                >
                    {isLinkMode ? "Crear un nuevo libro" : "¿Ya tienes un libro creado? Ponga el link del libro"}
                </button>

                <h2 className="text-xl font-bold mt-6">Libros Disponibles</h2>
                <div className="w-full max-w-md">
                    {books.map((book) => (
                        <div key={book.id} className="p-4 bg-gray-800 border border-gray-700 rounded mb-2 flex flex-col items-center">
                            {book.cover_url && (
                                <img src={book.cover_url} alt="Portada" className="w-32 h-48 object-cover mb-2 rounded" />
                            )}
                            <h3 className="font-bold">{book.title}</h3>
                            <p className="text-sm">{book.description}</p>
                            <button 
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded mt-2"
                                onClick={() => handleDeleteBook(book.id)}
                            >
                                Eliminar
                            </button>
                            <a href={book.cover_url} target="_blank" className="text-blue-500 mt-2">Ver el libro</a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
