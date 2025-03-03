import { useState, useEffect } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Navbar() {
    const [role, setRole] = useState("");  
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter(); 

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!error) setRole(data?.role);
        };

        fetchUserRole();
    }, []);

    const handleLogout = () => setShowLogoutModal(true);
    
    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
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
            {/* Botón de Logout en la parte inferior izquierda */}
            <button 
                onClick={handleLogout} 
                className="absolute bottom-4 left-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all"
            >
                Cerrar sesión
            </button>

            {/* Modal de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={confirmLogout}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all">
                                Sí
                            </button>
                            <button onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

