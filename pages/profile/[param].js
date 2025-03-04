import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { param } = router.query; // Obtener el parámetro de la URL

    useEffect(() => {
        if (!param) return;

        const fetchProfile = async () => {
            let data;
            let error;

            // Verificar si el parámetro es un UUID o un nombre de usuario
            if (param.startsWith('@')) {
                // Si comienza con '@', es un nombre de usuario
                const username = param.slice(1); // Eliminar el '@' para obtener el nombre de usuario
                ({ data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single());
            } else {
                // Si no, asumimos que es un UUID
                ({ data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', param) // Buscar por UUID
                    .single());
            }

            if (error) {
                console.error('Error al obtener el perfil:', error);
                router.push('/'); // Redirigir al inicio si hay un error
                return;
            }

            setProfile(data);
            setLoading(false);
        };

        fetchProfile();
    }, [param]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!profile) {
        return <div>Perfil no encontrado.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-semibold mb-4">Perfil de {profile.username}</h1>
            
            {/* Avatar */}
            <img
                src={profile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                alt="Avatar"
                className="w-32 h-32 rounded-full mb-4"
            />
            
            {/* Nombre de usuario */}
            <p className="text-xl mb-4">{profile.username}</p>
        </div>
    );
}

