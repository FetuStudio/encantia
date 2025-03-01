import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UserArea() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            setUser(user);

            if (user) {
                const { data, error: roleError } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                if (roleError) {
                    console.error('Error fetching role:', roleError);
                    return;
                }
                setRole(data?.role);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
            {/* Barra de navegación superior con "Inicio", "Chat" y "Libros" */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://i.ibb.co/933TjLds/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-12"
                    />
                </div>

                <div className="flex gap-4">
                    {/* Botón de "Inicio" */}
                    <button
                        onClick={() => window.location.href = "https://encantia.lat/"}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>

                    {/* Botón de "Chat" */}
                    <button
                        onClick={() => router.push('/chat')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
                    >
                        Chat
                    </button>

                    {/* Botón de "Libros" */}
                    <button
                        className="p-2 bg-gray-700 text-white rounded"
                        onClick={() => router.push('/libros')}
                    >
                        Libros
                    </button>

                    {role === 'owner' && (
                        <button
                            className="p-2 bg-green-600 text-white rounded"
                            onClick={() => router.push('/crear-libro')}
                        >
                            Crear Libro
                        </button>
                    )}
                </div>
            </div>

            {/* Aquí puedes agregar más contenido si lo deseas */}
        </div>
    );
}
