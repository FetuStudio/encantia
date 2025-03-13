import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userEmail, setUserEmail] = useState(""); // Almacena el correo del usuario
    const [username, setUsername] = useState(""); // Almacena el nombre de usuario ingresado
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false); // Modal para ingresar nombre de usuario
    const [error, setError] = useState(""); // Para mostrar errores (por ejemplo, múltiples perfiles)
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            setUserEmail(user.email); // Establecer el correo del usuario

            // Obtener el perfil del usuario en la tabla 'profiles'
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, avatar_url, name')
                .eq('email', user.email); // Usar 'email' para buscar perfiles

            if (profileError) {
                setError("Error al obtener el perfil");
                return;
            }

            if (profileData && profileData.length > 0) {
                // Si existe más de un perfil para el mismo correo, mostrar un error
                if (profileData.length > 1) {
                    setError("Error: Existen múltiples perfiles con el mismo correo.");
                } else {
                    setUserProfile(profileData[0]);
                }
            } else {
                // Si no existe, abrir el modal para que ingrese su nombre de usuario
                setIsUsernameModalOpen(true);
            }

            // Obtener el rol del usuario
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

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleUsernameSubmit = async () => {
        if (!username) {
            setError("El nombre de usuario es obligatorio.");
            return;
        }

        // Insertar el perfil con el nombre de usuario
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                { email: userEmail, name: username }
            ]);

        if (error) {
            setError("Error al crear el perfil");
            return;
        }

        setUserProfile(data[0]); // Actualizar el perfil
        setIsUsernameModalOpen(false); // Cerrar el modal
    };

    // Función para manejar el clic en la foto de perfil y abrir/cerrar el menú
    const toggleMenu = () => setShowMenu(!showMenu);

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
                </div>

                {/* Foto de perfil en la parte superior derecha */}
                {userProfile && (
                    <div className="relative">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full cursor-pointer"
                            onClick={toggleMenu}
                        />

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

            {/* Modal para ingresar nombre de usuario */}
            {isUsernameModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <h2 className="mb-4">Ingresa un nombre de usuario</h2>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mb-4 p-2 border border-gray-600 bg-gray-800 text-white rounded"
                            placeholder="Nombre de usuario"
                        />
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleUsernameSubmit}
                                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => setIsUsernameModalOpen(false)}
                                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all"
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
