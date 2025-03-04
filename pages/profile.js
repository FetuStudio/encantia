import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            // Obtener el usuario autenticado
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                // Redirigir al inicio si no hay usuario
                router.push('/');
                return;
            }
            
            setUser(user);
            
            // Verificar si el perfil del usuario ya existe
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Si el perfil no existe, crearlo
            if (error || !data) {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: user.id,
                            username: user.user_metadata.full_name || 'Usuario',
                            avatar_url: user.user_metadata.avatar_url || '',
                        },
                    ]);

                if (insertError) {
                    console.error('Error al crear el perfil:', insertError);
                    return;
                }
                
                // Cargar el perfil recién creado
                setProfile({
                    id: user.id,
                    username: user.user_metadata.full_name || 'Usuario',
                    avatar_url: user.user_metadata.avatar_url || '',
                });
            } else {
                // Si el perfil ya existe, cargarlo
                setProfile(data);
            }

            setLoading(false);
        };

        fetchUserProfile();
    }, [router]);

    // Enlace al perfil del usuario
    const profileLink = user ? `https://www.encantia.lat/profile/${user.id}` : '';

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-semibold mb-4">Perfil de {profile?.username}</h1>
            
            {/* Avatar */}
            <img
                src={profile?.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                alt="Avatar"
                className="w-32 h-32 rounded-full mb-4"
            />
            
            {/* Nombre de usuario */}
            <p className="text-xl mb-4">{profile?.username}</p>
            
            {/* Enlace al perfil */}
            <p className="text-lg text-blue-400">
                <a href={profileLink} target="_blank" rel="noopener noreferrer">
                    Ver mi perfil
                </a>
            </p>
        </div>
    );
}
