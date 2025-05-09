import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [users, setUsers] = useState([]);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isProfileExisting, setIsProfileExisting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [events, setEvents] = useState([]);
    const [videos, setVideos] = useState([]);

    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileData) setUserProfile(profileData);
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error) setUsers(data);
    }, []);

    const fetchImages = useCallback(async () => {
        const { data, error } = await supabase.from('cardimg').select('url');
        if (!error) setImages(data);
    }, []);

    const fetchEvents = useCallback(async () => {
        const { data, error } = await supabase.from('events_luminus').select('*').order('hora_inicio', { ascending: true });
        if (!error) setEvents(data);
    }, []);

    const fetchVideos = useCallback(async () => {
        const { data, error } = await supabase.from('videos_luminus').select('*');
        if (!error) setVideos(data);
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchUsers();
        fetchImages();
        fetchEvents();
        fetchVideos();
    }, [fetchUserProfile, fetchUsers, fetchImages, fetchEvents, fetchVideos]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) router.push('/');
    };

    const handleProfileSubmit = async () => {
        setErrorMessage("");
        setIsProfileExisting(false);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            setErrorMessage("No se pudo obtener el usuario.");
            return;
        }

        const existingUser = users.find(u => u.name.toLowerCase() === nickname.toLowerCase());
        if (existingUser) {
            setIsProfileExisting(true);
            return;
        }

        const newProfile = {
            user_id: user.id,
            name: nickname,
            avatar_url: avatarUrl,
            email: user.email,
        };

        const { error: upsertError } = await supabase.from('profiles').upsert([newProfile], { onConflict: ['user_id'] });

        if (!upsertError) {
            setUserProfile(newProfile);
            router.push('/');
        } else {
            setErrorMessage(`Error: ${upsertError.message}`);
        }
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
        { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/EventsArea' },
        { icon: "https://images.encantia.lat/luminus-s.png", name: "Luminus Studios", url: '/luminus' },
        { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
        { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
    ];

    const nextImage = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    const prevImage = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

    if (!userProfile) {
        return (
            <div className="bg-gray-900 min-h-screen flex flex-col justify-center items-center">
                <div className="text-white font-bold text-lg mb-4">¡Hola! Completa tu perfil</div>
                <input type="text" placeholder="Nombre de usuario" value={nickname} onChange={(e) => setNickname(e.target.value)} className="p-2 mb-4 text-black rounded" />
                <input type="text" placeholder="URL de tu foto de perfil" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="p-2 mb-4 text-black rounded" />
                <button onClick={handleProfileSubmit} className="p-2 bg-blue-500 text-white rounded">Guardar perfil</button>
                {isProfileExisting && (<div className="text-red-500 mt-2">Este nombre de usuario ya está en uso.</div>)}
                {errorMessage && (<div className="text-red-500 mt-2">{errorMessage}</div>)}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="text-2xl font-bold text-center py-4">Luminus Studios</div>

            {/* Carrousel */}
            <div className="flex justify-center items-center py-6">
                <div className="relative w-96 h-64 bg-gray-800 overflow-hidden rounded-lg">
                    {images.length > 0 ? (
                        <img src={images[currentIndex]?.url} alt={`Imagen ${currentIndex + 1}`} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center">Cargando imágenes...</div>
                    )}
                    <button onClick={prevImage} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-600 p-2 rounded-full">&lt;</button>
                    <button onClick={nextImage} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-600 p-2 rounded-full">&gt;</button>
                </div>
            </div>

            {/* Eventos */}
            <div className="text-xl font-bold text-center py-4">Eventos</div>
            <div className="px-4 space-y-4">
                {events.length > 0 ? events.map(event => (
                    <div key={event.id} className="bg-gray-800 p-4 rounded-lg shadow text-white">
                        <h2 className="text-lg font-bold">{event.titulo}</h2>
                        <p className="text-sm text-gray-300">{event.descripcion}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            🕒 {new Date(event.hora_inicio).toLocaleString()} - {new Date(event.hora_fin).toLocaleString()}
                        </p>
                    </div>
                )) : <div className="text-center text-gray-400">No hay eventos próximos.</div>}
            </div>

            {/* Videos/Directos */}
            <div className="text-xl font-bold text-center py-6">Videos/Directos</div>
            <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {videos.length > 0 ? videos.map(video => {
                    let embedUrl = "";
                    if (video.link.includes("youtube")) {
                        const videoId = video.link.includes("youtu.be") ? video.link.split("youtu.be/")[1] : new URL(video.link).searchParams.get("v");
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (video.link.includes("kick.com")) {
                        const username = video.link.split("kick.com/")[1];
                        embedUrl = `https://player.kick.com/${username}`;
                    } else if (video.link.includes("twitch.tv")) {
                        const channel = video.link.split("twitch.tv/")[1];
                        embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=localhost`;
                    }
                    return (
                        <div key={video.id} className="bg-gray-800 p-3 rounded-lg shadow-md">
                            <h3 className="text-md font-semibold mb-2">{video.titulo}</h3>
                            {embedUrl ? (
                                <iframe className="w-full h-60 object-contain rounded-lg" src={embedUrl} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            ) : (
                                <p className="text-gray-400 text-sm">Enlace no válido</p>
                            )}
                        </div>
                    );
                }) : <div className="text-center text-gray-400 col-span-full">No hay videos disponibles.</div>}
            </div>

            {/* Navegación inferior */}
            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-13 w-auto" />
                {navButtons.map((button, index) => (
                    <div key={index} className="relative group">
                        <button onClick={() => router.push(button.url)} className="p-2 rounded-full bg-gray-800 text-white text-xl">
                            <img src={button.icon} alt={button.name} className="w-8 h-8" />
                        </button>
                        <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1">
                            {button.name}
                        </span>
                    </div>
                ))}
                {userProfile && (
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full bg-gray-800">
                            <img src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'} alt="Avatar" className="w-8 h-8 rounded-full" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                                <button onClick={() => router.push(`/profile/${userProfile.user_id}`)} className="w-full text-left px-4 py-2 hover:bg-gray-700">Ver mi perfil</button>
                                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700">Cerrar sesión</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Luminus Studios
            </div>
        </div>
    );
}
