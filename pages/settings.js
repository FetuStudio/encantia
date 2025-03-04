import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://i.ibb.co/d0mWy0kP/perfildef.png');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error('Error fetching user:', userError);
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

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile:', profileError);
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

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email, // Asegurar que el correo siempre esté actualizado
                username,
                avatar_url: avatarUrl,
            });

        if (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar perfil');
        } else {
            alert('Perfil actualizado correctamente');
        }
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white">
            <h1 className="text-3xl font-semibold mb-6">Configuración de Perfil</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col items-center">
                        <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            className="w-32 h-32 rounded-full border-4 border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Email</label>
                        <input
                            type="text"
                            value={email}
                            disabled
                            className="px-2 py-1 text-black rounded w-full bg-gray-700 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Nombre de Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="px-2 py-1 text-black rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Avatar URL</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="px-2 py-1 text-black rounded w-full"
                        />
                    </div>
                    <button
                        onClick={updateProfile}
                        className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-400"
                    >
                        Guardar Cambios
                    </button>
                </div>
            )}
        </div>
    );
}
