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
        <div className="relative flex flex-col items-center justify-between min-h-screen p-3 bg-gray-800 text-white">
            {/* Fondo igual al del navbar con un color sólido */}
            <div className="absolute inset-0 bg-gray-800 opacity-80"></div>

            {/* Navbar */}
            <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto z-10 bg-gray-800 bg-opacity-90 rounded-xl shadow-lg p-3">
                {/* Logo */}
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-10 cursor-pointer" onClick={() => router.push("/")} />

                {/* Botones Centrales */}
                <div className="flex gap-4">
                    {["Inicio", "Eventos", "Chat", "Libros"].map((item, index) => (
                        <button key={index} onClick={() => router.push(`/${item.toLowerCase()}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm shadow-md">
                            {item}
                        </button>
                    ))}
                    {role === "owner" && (
                        <button onClick={() => router.push('/crear-libro')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all text-sm shadow-md">
                            Crear Libro
                        </button>
                    )}
                </div>

                {/* Botón de Logout */}
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all text-sm shadow-md">
                    Logout
                </button>
            </div>

            {/* Modal de Logout con fondo difuminado */}
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

