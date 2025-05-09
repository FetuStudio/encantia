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
                    .insert([{
                        id: user.id,
                        username: user.user_metadata.full_name || 'Usuario',
                        avatar_url: user.user_metadata.avatar_url || '',
                    }]);

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

    // Redirigir al perfil del usuario en la ruta /profile/[uuid]
    useEffect(() => {
        if (user && profile) {
            // Redirigir a la página de perfil con el UUID del usuario
            router.push(`/profile/${user.id}`);
        }
    }, [user, profile, router]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return null; // No es necesario renderizar nada ya que redirigimos
}
