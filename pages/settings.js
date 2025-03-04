import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://i.ibb.co/d0mWy0kP/perfildef.png');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error('Error fetching user:', userError);
                setStatusMessage('Error al obtener los datos del usuario.');
                return;
            }
            const currentUser = userData.user;
            setUser(currentUser);
            setEmail(currentUser.email);

            // Asegurar que el usuario esté en la tabla profiles
            await supabase.from('profiles').upsert({ id: currentUser.id, email: currentUser.email }, { onConflict: ['id'] });

            // Obtener perfil desde la tabla profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', currentUser.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile data:', profileError);
                setStatusMessage(`Hubo un error al obtener los datos del perfil: ${profileError.message}`);
            } else {
                setUsername(profileData?.username || '');
                setAvatarUrl(profileData?.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png');
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, []);

    const updateProfile = async () => {
        if (!user) return;

        // Verificar si hay cambios en los campos
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email, username, avatar_url')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile data for update:', profileError);
            setStatusMessage(`Hubo un error al intentar obtener los datos del perfil para actualizar: ${profileError.message}`);
            return;
        }

        const emailChanged = profileData.email !== email;
        const usernameChanged = profileData.username !== username;
        const avatarChanged = profileData.avatar_url !== avatarUrl;

        if (!emailChanged && !usernameChanged && !avatarChanged) {
            setStatusMessage('No hay cambios para guardar.');
            return; // No actualiza si no hay cambios
        }

        // Realizamos el upsert en la base de datos
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: email, // Actualiza email siempre
                username: username, // Actualiza el nombre de usuario
                avatar_url: avatarUrl === 'https://i.ibb.co/d0mWy0kP/perfildef.png' ? null : avatarUrl, // Solo actualiza avatar_url si no es el predeterminado
                updated_at: new Date().toISOString(), // Actualiza el campo 'updated_at'
            });

        if (error) {
            console.error('Error updating profile:', error);
            setStatusMessage(`Hubo un error al actualizar tu perfil: ${error.message}`);
        } else {
            setStatusMessage('Perfil actualizado correctamente.');
        }
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white dark:bg-gray-900 dark:text-white">
            {/* Barra de navegación */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp" // Logo
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    {/* Botón de "Inicio" */}
                    <button
                        onClick={() => window.location.href = "https://www.encantia.lat/"}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                </div>
            </div>

            {/* Contenido de la configuración */}
            <div className="flex justify-center items-center h-full">
                <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-semibold mb-6 text-center">Configuración de Perfil</h1>
                    {loading ? (
                        <p className="text-center">Cargando...</p>
                    ) : (
                        <div className="space-y-6">
                            {/* Imagen de Avatar */}
                            <div className="flex justify-center">
                                <img 
                                    src={avatarUrl} 
                                    alt="Avatar" 
                                    className="w-32 h-32 rounded-full border-4 border-gray-700"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm">Email</label>
                                <input
                                    type="text"
                                    value={email}
                                    disabled
                                    className="px-4 py-2 text-black rounded w-full bg-gray-700 cursor-not-allowed"
                                />
                            </div>

                            {/* Nombre de Usuario */}
                            <div>
                                <label className="block text-sm">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="px-4 py-2 text-black rounded w-full bg-gray-700"
                                />
                            </div>

                            {/* Avatar URL */}
                            <div>
                                <label className="block text-sm">Avatar URL</label>
                                <input
                                    type="text"
                                    value={avatarUrl === 'https://i.ibb.co/d0mWy0kP/perfildef.png' ? '' : avatarUrl} // Mostrar solo si no es el avatar predeterminado
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="px-4 py-2 text-black rounded w-full bg-gray-700"
                                />
                            </div>

                            {/* Estado de la operación */}
                            {statusMessage && (
                                <div className="text-center text-sm font-semibold mt-4">
                                    <p>{statusMessage}</p>
                                </div>
                            )}

                            {/* Botón de guardar cambios */}
                            <button
                                onClick={updateProfile}
                                className="w-full py-2 bg-green-500 rounded-lg hover:bg-green-400 transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
