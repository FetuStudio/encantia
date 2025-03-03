import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Libros() {
    const [books, setBooks] = useState([]); 
    const [role, setRole] = useState("");  // Estado para almacenar el rol del usuario
    const [showLogoutModal, setShowLogoutModal] = useState(false);
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

        fetchBooks();
        fetchUserRole();
    }, []);

    const handleLogout = async () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className={relative flex flex-col h-screen p-4 bg-gray-900 text-white ${showLogoutModal ? 'backdrop-blur-md' : ''}}>
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

            <button
                onClick={handleLogout}
                className="fixed bottom-4 left-4 px-6 py-2 bg-red-800 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
                Logout
            </button>

            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-gray-600 text-white p-6 rounded-lg shadow-lg">
                        <p className="text-lg font-bold mb-4">¿Estás seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
