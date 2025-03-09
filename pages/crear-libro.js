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
    const [role, setRole] = useState("");  // Estado para el rol del usuario
    const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario
    const [showMenu, setShowMenu] = useState(false); // Estado para mostrar el menú del perfil
    const router = useRouter();

    useEffect(() => {
        fetchBooks();
        fetchUserRole();
        fetchUserProfile();
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

        // Verificamos el rol
        console.log("Rol del usuario:", data?.role); // Esto nos ayuda a verificar el rol
        setRole(data?.role);  // Asignamos el rol del usuario
    };

    const fetchUserProfile = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const { data, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        if (!profileError) {
            setUserProfile(data);
        }
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
        if (!title || !description || !coverUrl || chapters.some(chap => !chap.content)) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const { data, error } = await supabase.from("books").insert([{
            title,
            description,
            cover_url: coverUrl
        }]);

        if (error) {
            console.error("Error al crear el libro:", error.message);
            alert("Hubo un problema al guardar el libro: " + error.message);
            return;
        }

        alert("Libro creado con éxito!");
        setTitle("");
        setDescription("");
        setCoverUrl("");
        setChapters([{ number: 1, content: "" }]);
        fetchBooks(); 
    };

    const handleLinkSubmit = async () => {
        if (!bookLink || !bookTitle) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const { data, error } = await supabase.from("books").insert([{
            title: bookTitle,
            description: "No disponible", 
            cover_url: bookLink
        }]);

        if (error) {
            console.error("Error al agregar el libro con el link:", error.message);
            alert("Hubo un problema al agregar el libro: " + error.message);
            return;
        }

        alert("Libro agregado con éxito!");
        setBookLink("");
        setBookTitle("");
        fetchBooks(); 
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

    // Función para manejar el clic en la foto de perfil y abrir/cerrar el menú
    const toggleMenu = () => setShowMenu(!showMenu);

    // Función para manejar el logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

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

                    {/* Botón de "Discord" */}
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

                    {/* Mostrar el botón "Crear Libro" solo si el rol es 'owner' */}
                    {role === 'owner' ? (
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>
                    ) : (
                        <p className="text-red-500">No tienes permisos para crear libros.</p> // Mensaje si el rol no es owner
                    )}
                </div>

                {/* Foto de perfil en la parte superior derecha */}
                {userProfile && (
                    <div className="relative">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full cursor-pointer"
                            onClick={toggleMenu} // Al hacer clic en la imagen, toggle el menú
                        />

                        {/* Menú desplegable */}
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                                <ul className="py-2">
                                    <li
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                                        onClick={() => router.push('/settings')}
                                    >
                                        Configuración
                                    </li>
                                    <li
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                                        onClick={() => router.push('/profile')}
                                    >
                                        Perfil
                                    </li>
                                    {/* Cerrar sesión dentro del menú */}
                                    <li
                                        className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700"
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Listado de libros */}
            <div className="flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Mis Libros</h1>

                {/* Lista de libros */}
                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} className="flex flex-col items-center bg-gray-800 p-4 rounded-lg mb-4 w-full max-w-md">
                            <h2 className="text-xl font-bold">{book.title}</h2>
                            <p className="text-gray-400">{book.description}</p>
                            <div className="flex gap-4 mt-2">
                                {/* Botón para eliminar el libro */}
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

            {/* Sección para agregar libros con capítulos */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Agregar Libro</h2>

                {/* Input para el título y descripción */}
                <div className="mb-4">
                    <label className="block mb-2">Título:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 text-black rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Descripción:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 text-black rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">URL de portada:</label>
                    <input
                        type="text"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="w-full px-4 py-2 text-black rounded-lg"
                    />
                </div>

                {/* Añadir capítulos */}
                <h3 className="font-bold text-xl mb-4">Capítulos</h3>
                {chapters.map((chapter, index) => (
                    <div key={index} className="mb-4">
                        <label className="block">Capítulo {chapter.number}</label>
                        <textarea
                            value={chapter.content}
                            onChange={(e) => handleChapterChange(index, e.target.value)}
                            className="w-full px-4 py-2 text-black rounded-lg"
                        />
                    </div>
                ))}
                <button
                    onClick={handleAddChapter}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                >
                    Agregar capítulo
                </button>

                <button
                    onClick={handleCreateBook}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
                >
                    Crear Libro
                </button>
            </div>

            {/* Sección para usar link */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Usar Link para Subir Libro</h2>

                <div className="mb-4">
                    <label className="block mb-2">Título del Libro:</label>
                    <input
                        type="text"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        className="w-full px-4 py-2 text-black rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Link del Libro:</label>
                    <input
                        type="text"
                        value={bookLink}
                        onChange={(e) => setBookLink(e.target.value)}
                        className="w-full px-4 py-2 text-black rounded-lg"
                    />
                </div>

                <button
                    onClick={handleLinkSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                >
                    Subir Libro desde Link
                </button>
            </div>
        </div>
    );
}
