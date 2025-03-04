import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videos, setVideos] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const router = useRouter();
    const { uuid } = router.query;

    useEffect(() => {
        if (!uuid) return;

        const fetchProfile = async () => {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uuid)
                .single();

            if (profileError) {
                console.error('Error al obtener el perfil:', profileError);
                router.push('/');
                return;
            }

            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', uuid)
                .single();

            if (roleError) {
                console.error('Error al obtener el rol:', roleError);
            }

            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('*')
                .eq('user_id', uuid);

            if (videosError) {
                console.error('Error al obtener los videos:', videosError);
            }

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

    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleUploadVideo = async () => {
        if (!videoFile) {
            alert("Selecciona un archivo de video.");
            return;
        }

        const fileExtension = videoFile.name.split('.').pop();
        const fileName = `${uuid}_${Date.now()}.${fileExtension}`;
        const filePath = `videos/${fileName}`;

        const { data, error } = await supabase.storage
            .from('videos')
            .upload(filePath, videoFile);

        if (error) {
            console.error('Error al subir el video:', error);
            return;
        }

        const { publicURL, error: urlError } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        if (urlError) {
            console.error('Error al obtener la URL pública:', urlError);
            return;
        }

        const { error: insertError } = await supabase
            .from('videos')
            .insert([
                {
                    user_id: uuid,
                    video_url: publicURL,
                },
            ]);

        if (insertError) {
            console.error('Error al insertar el video en la base de datos:', insertError);
            return;
        }

        setVideos((prevVideos) => [
            ...prevVideos,
            { video_url: publicURL }
        ]);
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!profile) {
        return <div>Perfil no encontrado.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <div className="flex justify-between items-center p-4 bg-gray-900">
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
                        <h1 className="text-3xl font-semibold">{profile.name}</h1>
                        <p className="text-lg text-gray-400">Miembro desde {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-8 text-center">
                    <p className="text-xl">Roles: {userRole}</p>
                </div>

                {/* Formulario para subir video */}
                <div className="mt-8 flex items-center gap-4">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="bg-gray-800 text-white p-2 rounded-lg"
                    />
                    <button
                        onClick={handleUploadVideo}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Subir Video
                    </button>
                </div>

                {/* Mostrar videos */}
                <div className="mt-8">
                    <h2 className="text-2xl mb-4">Videos Subidos</h2>
                    {videos.length > 0 ? (
                        <div className="space-y-4">
                            {videos.map((video, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <video
                                        controls
                                        className="w-64 h-64"
                                    >
                                        <source src={video.video_url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div>
                                        <p className="text-lg">Video {index + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No hay videos subidos.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
