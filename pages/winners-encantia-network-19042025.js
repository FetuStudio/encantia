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
    const [topWinners, setTopWinners] = useState([]);
    const router = useRouter();

    const fetchUserProfile = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileData) {
            setUserProfile(profileData);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data);
        }
    }, []);

    const fetchTopWinners = useCallback(async () => {
        const { data, error } = await supabase.from('ganadores-kot').select('*').limit(1).order('id', { ascending: false });
        if (error) {
            console.error('Error fetching top winners:', error);
        } else {
            if (data && data.length > 0) {
                setTopWinners(data);
            }
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchUsers();
        fetchTopWinners();
    }, [fetchUserProfile, fetchUsers, fetchTopWinners]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            router.push('/');
        }
    };

    const handleProfileSubmit = async () => {
        setErrorMessage(""); 
        setIsProfileExisting(false);
    
        const { data: { user }, error: userError } = await supabase.auth.getUser();
    
        if (userError || !user) {
            console.error("❌ No se pudo obtener el usuario", userError);
            setErrorMessage("No se pudo obtener el usuario. Intenta iniciar sesión nuevamente.");
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
    
        const { error: upsertError } = await supabase
            .from('profiles')
            .upsert([newProfile], { onConflict: ['user_id'] });
    
        if (upsertError) {
            setErrorMessage(`Error: ${upsertError.message}`);
            return;
        }
    
        setUserProfile(newProfile);
        router.push('/');
    };

    const navButtons = [
        { icon: "https://images.encantia.lat/home.png", name: "Inicio", url: '/' },
        { icon: "https://images.encantia.lat/libros.png", name: "Libros", url: '/libros' },
        { icon: "https://images.encantia.lat/eventos.png", name: "Eventos", url: '/EventsArea' },
        { icon: "https://images.encantia.lat/luminus-s.png", name: "Luminus Studios", url: '/luminus' },
        { icon: "https://images.encantia.lat/discord.png", name: "Discord", url: 'https://discord.gg/BRqvv9nWHZ' }
    ];

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="absolute top-209 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                Inicio
            </div>

            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 p-2 rounded-full shadow-lg space-x-4 w-max">
                <img
                    src="https://images.encantia.lat/encantia-logo-2025.webp"
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

                {userProfile && (
                    <div className="relative">
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full bg-gray-800 text-white text-xl transition-transform transform hover:scale-110">
                            <img
                                src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        </button>

                        {/* Menú desplegable encima de la foto */}
                        {isDropdownOpen && (
                            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg shadow-md mt-2 w-40">
                                <button
                                    onClick={() => router.push(`/profile/${userProfile.user_id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                                >
                                    Ver mi perfil
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mostrar TOP1, TOP2, TOP3 con lo que ganaron */}
            <div className="top-winners-section text-center mt-0 px-4">
                {topWinners.length > 0 && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-white text-3xl font-bold mb-8">🏆 TOP Ganadores</h2>
                        <div className="flex justify-center items-start space-x-6">
                            {/* TOP 1 */}
                            <div className="top1 w-1/3 relative">
                                {/* Imagen de perfil de t1 encima del texto */}
                                <img src={topWinners[0]?.t1p} alt="Top 1" className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 object-cover rounded-full border-4 border-white" />
                                <div className="bg-gradient-to-b from-blue-500 to-blue-700 p-5 rounded-lg text-white text-center mt-40 relative z-10">
                                    <p className="text-2xl font-semibold mb-2">{topWinners[0]?.t1}</p>
                                    <p className="text-black text-sm italic">{topWinners[0]?.['t1-qg'] || "No hay información sobre lo que ganó."}</p>
                                    <p className="text-lg font-semibold text-yellow-300">TOP 1</p> {/* Indicando que es TOP 1 */}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8">
                            {/* TOP 2 */}
                            <div className="top2 w-1/3 relative">
                                {/* Imagen de perfil de t2 encima del texto */}
                                <img src={topWinners[0]?.t2p} alt="Top 2" className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 object-cover rounded-full border-4 border-white" />
                                <div className="bg-gradient-to-b from-green-500 to-green-700 p-5 rounded-lg text-white text-center mt-40 relative z-10">
                                    <p className="text-2xl font-semibold mb-2">{topWinners[0]?.t2}</p>
                                    <p className="text-black text-sm italic">{topWinners[0]?.['t2-qg'] || "No hay información sobre lo que ganó."}</p>
                                    <p className="text-lg font-semibold text-yellow-300">TOP 2</p> {/* Indicando que es TOP 2 */}
                                </div>
                            </div>

                            {/* TOP 3 */}
                            <div className="top3 w-1/3 relative">
                                {/* Imagen de perfil de t3 encima del texto */}
                                <img src={topWinners[0]?.t3p} alt="Top 3" className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 object-cover rounded-full border-4 border-white" />
                                <div className="bg-gradient-to-b from-red-500 to-red-700 p-5 rounded-lg text-white text-center mt-40 relative z-10">
                                    <p className="text-2xl font-semibold mb-2">{topWinners[0]?.t3}</p>
                                    <p className="text-black text-sm italic">{topWinners[0]?.['t3-qg'] || "No hay información sobre lo que ganó."}</p>
                                    <p className="text-lg font-semibold text-yellow-300">TOP 3</p> {/* Indicando que es TOP 3 */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-3 right-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
                © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
            </div>
        </div>
    );
}
