import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

export default function Navbar() {
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profileComplete, setProfileComplete] = useState(null);

    const [platform, setPlatform] = useState("");
    const [channel_link, setChannelLink] = useState("");
    const [platform_user, setPlatformUser] = useState("");

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
        fetchProfile();
    }, [router]);

    if (profileComplete === null) {
        return null;
    }

    if (!profileComplete) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
                <h1 className="text-2xl font-bold mb-4">¡No puedes ver el contenido de esta página!</h1>
                <p className="mb-6 text-center max-w-md">
                    Para acceder a esta sección debes tener configurado tu nombre de usuario y foto de perfil.
                    Por favor, completa tu perfil para continuar.
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
        <div style={{ backgroundColor: '#032c3d' }} className="min-h-screen">
            <div className="flex justify-center">
                <img className="w-150 h-auto" src="https://images.encantia.lat/fg2.png" alt="FetuGames2Logo" />
            </div>

            <div
                className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center p-2 rounded-full shadow-lg space-x-4 w-max"
                style={{ backgroundColor: '#053c53' }}
            >
                <img
                    src="https://images.encantia.lat/fs.png"
                    alt="Logo"
                    className="h-13 w-auto"
                />

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
                            <button
                                onClick={() => router.push(`/account`)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
                                Configuración
                            </button>
                            <button
                                onClick={() => router.push(`/profile`)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
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

            <div className="max-w-md mx-auto mt-12 p-6 bg-gray-800 text-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">¡Quiero aparecer en el apartado de Live's!</h2>
                <p className="mb-4">
                    Requisitos: Ser un Jugador de Fetu Games 2 que vaya a hacer directo en cualquier plataforma de streaming.
                </p>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const userResp = await supabase.auth.getUser();
                        const user = userResp.data.user;
                        if (!user) {
                            alert("Debes iniciar sesión para enviar la solicitud.");
                            return;
                        }

                        const { error } = await supabase.from("live_requests").insert([
                            {
                                user_id: user.id,
                                platform,
                                channel_link,
                                platform_user
                            }
                        ]);

                        if (error) {
                            alert("Error al enviar la solicitud: " + error.message);
                        } else {
                            alert("¡Solicitud enviada con éxito!");
                            setPlatform("");
                            setChannelLink("");
                            setPlatformUser("");
                        }
                    }}
                >
                    <div className="mb-4">
                        <label className="block mb-1">Plataforma de Streaming</label>
                        <input
                            type="text"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="Ej: Twitch, YouTube, Kick..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Link del Canal</label>
                        <input
                            type="url"
                            value={channel_link}
                            onChange={(e) => setChannelLink(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="https://twitch.tv/tuusuario"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">Usuario en la Plataforma</label>
                        <input
                            type="text"
                            value={platform_user}
                            onChange={(e) => setPlatformUser(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="tu_usuario123"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
                    >
                        Confirmar
                    </button>
                </form>
            </div>

            <div className="fixed bottom-3 right-3 text-gray-200 text-xs p-2 rounded-md shadow-md" style={{ backgroundColor: '#053c53' }}>
                © 2025 by Fetu Studios is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
