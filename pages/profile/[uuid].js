import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/cerrar el menú
    const router = useRouter();
    const { uuid } = router.query; // Obtener el UUID de la URL

    useEffect(() => {
        if (!uuid) return;

        const fetchProfile = async () => {
            // Obtener el perfil de la tabla profiles por UUID
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uuid) // Asegurándonos de buscar por UUID
                .single();

            if (profileError) {
                console.error('Error al obtener el perfil:', profileError);
                router.push('/'); // Redirigir al inicio si hay un error
                return;
            }

            // Obtener el rol del usuario desde la tabla user_roles
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', uuid) // Usamos el UUID para obtener los roles
                .single();

            if (roleError) {
                console.error('Error al obtener el rol:', roleError);
            }

            // Establecer los datos del perfil y el rol
            setProfile(profileData);
            setUserRole(roleData?.role || 'No asignado');
            setLoading(false);
        };

        fetchProfile();
    }, [uuid]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!profile) {
        return <div>Perfil no encontrado.</div>;
    }

    // Función para manejar el clic en la foto de perfil y abrir/cerrar el menú
    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            {/* Barra de navegación */}
            <div className="flex justify-between items-center p-4 bg-gray-900">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>
                <div className="flex gap-4">
                    {/* Botones de navegación */}
                    <button
                        onClick={() => router.push('/')}  // Redirige a la página de inicio de la app
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                    <button
                        onClick={() => router.push('/EventsArea')}  // Redirige a la página de eventos
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Eventos
                    </button>
                    <button
                        onClick={() => router.push('/libros')}  // Redirige a la página de libros
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Libros
                    </button>
                    <button
                        onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Discord
                    </button>
                </div>

                {/* Foto de perfil con el menú */}
                <div className="relative">
                    <img
                        src={profile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={handleMenuToggle}
                    />
                    {/* Menú desplegable */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 bg-gray-800 text-white rounded-md shadow-lg w-40">
                            <button
                                onClick={() => router.push('/profile')}
                                className="block px-4 py-2 text-sm hover:bg-gray-700"
                            >
                                Perfil
                            </button>
                            <button
                                onClick={() => router.push('/settings')}
                                className="block px-4 py-2 text-sm hover:bg-gray-700"
                            >
                                Configuración
                            </button>
                            <button
                                onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                                className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Perfil de usuario */}
            <div className="flex flex-col items-center justify-center p-8">
                <div className="flex items-center space-x-6">
                    <img
                        src={profile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full"
                    />
                    <div>
                        {/* Aquí mostramos el nombre de usuario que es 'name' */}
                        <h1 className="text-3xl font-semibold">{profile.name}</h1>
                        <p className="text-lg text-gray-400">Miembro desde {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-8 text-center">
                    <p className="text-xl">Roles: {userRole}</p>
                </div>
            </div>
        </div>
    );
}
