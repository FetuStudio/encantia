import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function Navbar() {
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profileComplete, setProfileComplete] = useState(null);
    const [lives, setLives] = useState([]);

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/fetustudios/fetugames2/inicio' },
        { icon: "https://images.encantia.lat/lives.png", name: "Live's", url: '/fetustudios/fetugames2/lives' },
    ];

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setAvatarUrl("");
                setProfileComplete(false);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("avatar_url, name")
                .eq("user_id", user.id)
                .single();

            if (
                profileError ||
                !profile ||
                !profile.avatar_url ||
                !profile.name ||
                profile.avatar_url.trim() === "" ||
                profile.name.trim() === ""
            ) {
                setProfileComplete(false);
                setAvatarUrl("");
            } else {
                setProfileComplete(true);
                setAvatarUrl(profile.avatar_url);
            }
        }

        async function fetchLives() {
            const { data, error } = await supabase
                .from("livesfg")
                .select("id, titulo, autor, plataforma, link");

            if (!error && data) {
                setLives(data);
            }
        }

        fetchProfile();
        fetchLives();
    }, [router]);

    function getMiniaturaFromLink(link) {
        try {
            const url = new URL(link);
            if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
                const videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
                return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
            // Aquí puedes agregar otras plataformas, ej. Twitch:
            if (url.hostname.includes("twitch.tv")) {
                // Twitch no tiene URL de miniatura directa simple,
                // pero se puede usar un placeholder o API Twitch (más avanzado).
                return "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";
            }
            // Si no reconoce la plataforma, usar imagen genérica
            return "https://via.placeholder.com/480x270.png?text=Sin+miniatura";
        } catch (e) {
            return "https://via.placeholder.com/480x270.png?text=Sin+miniatura";
        }
    }

    if (profileComplete === null) return null;

    if (!profileComplete) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
                <h1 className="text-2xl font-bold mb-4">¡No puedes ver el contenido de esta página!</h1>
                <p className="mb-6 text-center max-w-md">
                    Para acceder a esta sección debes tener configurado tu nombre de usuario y foto de perfil.
                </p>
                <button
                    onClick={() => router.push('/account')}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white font-semibold"
                >
                    Completar perfil
                </button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#032c3d' }} className="min-h-screen text-white">
            <div className="flex justify-center p-4">
                <img className="w-150 h-auto" src="https://images.encantia.lat/fg2.png" alt="FetuGames2Logo" />
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {lives.map((live) => (
                    <div key={live.id} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition">
                        <img
                            src={getMiniaturaFromLink(live.link)}
                            alt={live.titulo}
                            className="rounded w-full h-50 object-cover mb-2"
                        />
                        <h2 className="text-lg font-semibold">{live.titulo}</h2>
                        <p className="text-sm text-gray-300">Autor: {live.autor}</p>
                        <p className="text-sm text-gray-400 mb-2">Plataforma: {live.plataforma}</p>
                        <a
                            href={live.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-400 hover:text-blue-300 underline"
                        >
                            Ver transmisión
                        </a>
                    </div>
                ))}
            </div>

            <div
                className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center p-2 rounded-full shadow-lg space-x-4 w-max"
                style={{ backgroundColor: '#053c53' }}
            >
                <img src="https://images.encantia.lat/fs.png" alt="Logo" className="h-13 w-auto" />
                {navButtons.map((button, index) => (
                    <div key={index} className="relative group">
                        <button
                            onClick={() => router.push(button.url)}
                            className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110"
                        >
                            <img src={button.icon} alt={button.name} className="w-8 h-8" />
                        </button>
                        <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                            {button.name}
                        </span>
                    </div>
                ))}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110"
                    >
                        <img
                            src={avatarUrl || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                            <button onClick={() => router.push(`/account`)} className="w-full text-left px-4 py-2 hover:bg-gray-700">
                                Configuración
                            </button>
                            <button onClick={() => router.push(`/profile`)} className="w-full text-left px-4 py-2 hover:bg-gray-700">
                                Ver mi perfil
                            </button>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push('/');
                                }}
                                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-3 right-3 text-gray-200 text-xs p-2 rounded-md shadow-md" style={{ backgroundColor: '#053c53' }}>
                © 2025 by Fetu Studios is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
