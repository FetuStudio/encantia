import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/cerrar el menú
    const [videos, setVideos] = useState([]); // Para almacenar los videos del usuario
    const [videoFile, setVideoFile] = useState(null); // Para almacenar el archivo del video a subir
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

            // Obtener los videos del usuario desde la tabla videos
            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('*')
                .eq('user_id', uuid);

            if (videosError) {
                console.error('Error al obtener los videos:', videosError);
            }

            // Establecer los datos del perfil, rol y videos
            setProfile(profileData);
            setUserRole(roleData?.role || 'No asignado');
            setVideos(videosData || []);
            setLoading(false);
        };

        fetchProfile();
    }, [uuid]);

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    // Función para manejar el cambio de archivo de video
    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    // Función para subir el video a Supabase y asociarlo con el perfil
    const handleUploadVideo = async () => {
        if (!videoFile) return;

        setLoading(true);

        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        // Subir el video a Supabase Storage
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(filePath, videoFile);

        if (error) {
            console.error('Error uploading video:', error);
            setLoading(false);
            return;
        }

        // Obtener la URL pública del video
        const videoUrl = supabase.storage
            .from('videos')
            .getPublicUrl(filePath).publicURL;

        // Guardar el enlace en la base de datos (tabla 'videos')
        const { user } = await supabase.auth.getUser();

        const { error: dbError } = await supabase
            .from('videos')
            .insert([{ user_id: user.id, video_url: videoUrl }]);

        if (dbError) {
            console.error('Error saving video info:', dbError);
            setLoading(false);
            return;
        }

        // Recargar los videos después de la subida
        const { data: updatedVideos } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', user.id);

        setVideos(updatedVideos || []);
        setLoading(false);
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!profile) {
        return <div>Perfil no encontrado.</div>;
    }

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
                        onClick={() => router.push('/libros')}
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
                    <button
                        onClick={() => router.push('/fg2')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Fetu Games 2
                    </button>
                </div>

                {/* Foto de perfil con el menú */}
                <div className="relative flex items-center gap-4">
                    <button
                        onClick={() => document.getElementById('videoInput').click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Subir Video
                    </button>
                    <input
                        id="videoInput"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                    />
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

            {/* Subir video y mostrar los videos */}
            <div className="flex flex-col items-center justify-center p-8">
                {videoFile && (
                    <button
                        onClick={handleUploadVideo}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        {loading ? 'Subiendo...' : 'Subir Video'}
                    </button>
                )}

                {/* Mostrar videos */}
                <div className="mt-8 grid grid-cols-1 gap-4">
                    {videos.map((video, index) => (
                        <div key={index} className="w-full">
                            <video controls className="w-full">
                                <source src={video.video_url} type="video/mp4" />
                                Tu navegador no soporta el elemento de video.
                            </video>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
