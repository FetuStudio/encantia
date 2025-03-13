import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function Navbar() {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState("");  // Estado para el nombre de usuario
    const [avatarUrl, setAvatarUrl] = useState("");  // Estado para la URL de la foto de perfil
    const [imagePreview, setImagePreview] = useState(null); // Estado para mostrar la vista previa de la imagen
    const router = useRouter();

    useEffect(() => {
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

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('avatar_url, name')
                .eq('id', user.id)
                .single();

            if (!profileError) {
                setUserProfile(profileData);
                if (profileData?.name) {
                    setUsername(profileData.name);
                }
                if (profileData?.avatar_url) {
                    setAvatarUrl(profileData.avatar_url);
                    setImagePreview(profileData.avatar_url);
                }
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleUsernameChange = (e) => setUsername(e.target.value);

    const handleAvatarUrlChange = (e) => {
        const url = e.target.value;
        setAvatarUrl(url);
        setImagePreview(url); // Actualiza la vista previa de la imagen
    };

    const handleSaveProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        // Verificar si el nombre de usuario ya existe
        const { data: existingProfile, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("name", username)
            .single();

        if (error || !existingProfile) {
            // Guardar el nuevo nombre de usuario y la foto
            const { error: updateError } = await supabase
                .from("profiles")
                .upsert({ id: user.id, name: username, avatar_url: avatarUrl });

            if (updateError) {
                console.error("Error al actualizar perfil", updateError);
            } else {
                alert("Perfil actualizado correctamente.");
            }
        } else {
            alert("El nombre de usuario ya está en uso.");
        }
    };

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
                    {/* Otros botones de navegación */}
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

            {/* Formulario de creación o edición del perfil */}
            <div className="bg-gray-800 p-5 rounded-lg shadow-lg text-center">
                <h2 className="text-xl mb-4 text-white">Crear o Editar Perfil</h2>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-white">Nombre de Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg w-full"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="avatarUrl" className="block text-white">Foto de Perfil (URL):</label>
                    <input
                        type="text"
                        id="avatarUrl"
                        value={avatarUrl}
                        onChange={handleAvatarUrlChange}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg w-full"
                    />
                </div>

                <div className="mb-4">
                    <h3 className="text-white">Vista Previa de la Foto:</h3>
                    {imagePreview && (
                        <img src={imagePreview} alt="Vista previa" className="w-24 h-24 rounded-full mx-auto" />
                    )}
                </div>

                <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all"
                >
                    Guardar Perfil
                </button>
            </div>

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

