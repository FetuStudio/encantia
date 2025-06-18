import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
    const [userProfile, setUserProfile] = useState(null);
    const [musicas, setMusicas] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [listExpanded, setListExpanded] = useState(false); // Nuevo estado para la expansión de la lista
    const audioRef = useRef(null);
    const router = useRouter();

const currentMusic = musicas[currentIndex];

const fetchUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();
    if (profileData) setUserProfile(profileData);
}, []);

const fetchMusicas = useCallback(async () => {
    const { data, error } = await supabase.from('musicas').select('*');
    if (!error && data) setMusicas(data);
}, []);

useEffect(() => {
    fetchUserProfile();
    fetchMusicas();
}, [fetchUserProfile, fetchMusicas]);

useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const setMusicDuration = () => {
        setDuration(audio.duration);
    };

    const handleMusicEnd = () => {
        setIsPlaying(false);
        setHasEnded(true);
        setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setMusicDuration);
    audio.addEventListener("ended", handleMusicEnd);

    return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("loadedmetadata", setMusicDuration);
        audio.removeEventListener("ended", handleMusicEnd);
    };
}, [currentIndex]);

const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentMusic) return;

    if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
    } else {
        if (audio.src !== currentMusic.musica_url) {
            audio.src = currentMusic.musica_url;
        }
        audio.play();
        setIsPlaying(true);
        setHasEnded(false);
    }
};


const handleNext = () => {
    const audio = audioRef.current;
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    setCurrentIndex((prev) => (prev + 1) % musicas.length);
    setIsPlaying(false);
    setProgress(0);
    setHasEnded(false);
};

const handlePrev = () => {
    const audio = audioRef.current;
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    setCurrentIndex((prev) => (prev - 1 + musicas.length) % musicas.length);
    setIsPlaying(false);
    setProgress(0);
    setHasEnded(false);
};

const handleProgressChange = (e) => {
    const audio = audioRef.current;
    const newProgress = e.target.value;
    if (!audio) return;
    audio.currentTime = (newProgress / 100) * audio.duration;
    setProgress(newProgress);
};

const toggleExpand = () => setExpanded(!expanded);

const navButtons = [
    { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
    { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
    { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/events' },
    { icon: "https://images.encantia.lat/music.png", name: "Musica", url: '/music' },
    { icon: "https://images.encantia.lat/users2.png", name: "Usuarios", url: '/profiles' },
    { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
];

return (
    <div className="bg-gray-900 min-h-screen text-white pb-36 relative">
        {currentMusic && (
            <>
                <div className="fixed bottom-[100px] left-0 w-full h-1 bg-transparent z-50">
                    <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                </div>
                <div className={`fixed bottom-[104px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white w-full max-w-full flex items-center justify-between px-8 py-2 rounded-t-lg z-50 shadow-lg cursor-pointer ${expanded ? 'h-[250px]' : 'h-[70px]'}`} onClick={toggleExpand}>
                    <div className="flex items-center space-x-4 w-full">
                        <img src={currentMusic.portada_url} alt="Portada" className="w-16 h-16 object-cover rounded" />
                        <div className="flex flex-col justify-center w-full">
                            <h3 className="text-lg font-semibold">{currentMusic.titulo}</h3>
                            <p className="text-xs text-gray-400">{currentMusic.autor}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                            <img src="https://images.encantia.lat/previous2.png" alt="Prev" className="w-6 h-6" />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                        <img
                            src={isPlaying
                            ? "https://images.encantia.lat/pause.png"
                            : "https://images.encantia.lat/play.png"}
                            alt="Play/Pause"
                            className="w-8 h-8"
                         />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                            <img src="https://images.encantia.lat/next2.png" alt="Next" className="w-6 h-6" />
                        </button>

                    </div>
                </div>
                {expanded && (
                    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-full bg-gray-900 p-6 rounded-t-xl shadow-2xl z-50">
                        <div className="flex flex-col items-center w-full">
                            <img src={currentMusic.portada_url} alt="Portada" className="w-[600px] h-[600px] object-cover rounded-lg mb-6" />
                            <h2 className="text-3xl font-bold mb-3">{currentMusic.titulo}</h2>
                            <p className="text-sm text-gray-400 mb-6">{currentMusic.autor}</p>
                            <div className="flex space-x-6 mb-6">
                                <button onClick={handlePrev} className="text-4xl">⏮️</button>
                                <button onClick={handlePlayPause} className="text-5xl">{isPlaying ? "⏸️" : "▶️"}</button>
                                <button onClick={handleNext} className="text-4xl">⏭️</button>
                            </div>
                            <div className="w-full mb-4">
                                <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} className="w-full" />
                                <div className="flex justify-between text-xs">
                                    <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                                    <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} />
            </>
        )}

        <div className="pt-20 px-4 bg-gray-900 text-white">
            <h2 className="text-xl font-semibold mb-4">Lista de Canciones</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {musicas.map((musica, index) => (
                    <div key={musica.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                        onClick={() => {
                            setCurrentIndex(index);
                            setProgress(0);
                            setIsPlaying(false);
                            setHasEnded(false);
                        }}>
                        <div className="flex items-center space-x-4">
                            <img src={musica.portada_url} alt="Portada" className="w-12 h-12 object-cover rounded" />
                            <div>
                                <h3 className="text-lg font-semibold">{musica.titulo}</h3>
                                <p className="text-sm text-gray-400">{musica.autor}</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">{musica.categoria}</div>
                    </div>
                ))}
            </div>
        </div>

        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max z-40">
            <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-13 w-auto" />
            {navButtons.map((button, index) => (
                <div key={index} className="relative group">
                    <button onClick={() => router.push(button.url)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform group-hover:scale-110">
                        <img src={button.icon} alt={button.name} className="w-8 h-8" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        {button.name}
                    </span>
                </div>
            ))}
            {userProfile && (
                <div className="relative group">
                    <button onClick={() => router.push(`/profile/${userProfile.user_id}`)} className="p-1 rounded-full bg-gray-800 hover:ring-2 ring-green-400 transition-transform transform group-hover:scale-110">
                        <img src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                    </button>
                    <span className="absolute bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 transition-opacity">
                        Perfil
                    </span>
                </div>
            )}
        </div>

        <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
            © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
        </div>
    </div>
)};

