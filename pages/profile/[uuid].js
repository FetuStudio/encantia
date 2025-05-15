import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";

const Perfil = () => {
    const [role, setRole] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState(""); 
    const [avatarUrl, setAvatarUrl] = useState(""); 
    const [userEmail, setUserEmail] = useState(""); 
    const [profileExists, setProfileExists] = useState(true); 
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(""); 
    const [profileSaved, setProfileSaved] = useState(false); 
    const [users, setUsers] = useState([]); 
    
    const [followers, setFollowers] = useState([]); 
    const [newDescription, setNewDescription] = useState(""); 
    const [isEditing, setIsEditing] = useState(false); 
    const [followersCount, setFollowersCount] = useState(0); 
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false); // Estado para verificar si ya sigues al usuario

    const router = useRouter();
    const { uuid } = router.query; 

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error(authError);
                return;
            }
            setCurrentUser(user);
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (!uuid) return;

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*, role")
                    .eq("user_id", uuid)
                    .single();

                if (error) {
                    console.error("Error al obtener perfil:", error.message);
                    throw new Error(error.message);
                }

                setUserProfile(data);
                setNewDescription(data.description || ""); 
                setLoading(false);
            } catch (error) {
                console.error("Error general:", error);
                setErrorMessage("No se pudo cargar el perfil.");
                setLoading(false);
            }
        };

        fetchProfile();
    }, [uuid]);

    useEffect(() => {
        if (!uuid || !currentUser) return;

        const fetchFollowers = async () => {
            try {
                const { data: followersData, error } = await supabase
                    .from("followers")
                    .select("follower_id")
                    .eq("followed_id", uuid);

                if (error) {
                    console.error("Error al obtener seguidores:", error.message);
                    throw new Error(error.message);
                }

                setFollowersCount(followersData.length);

                const followersIds = followersData.map((follower) => follower.follower_id);
                const { data: followersDetails, error: followersError } = await supabase
                    .from("profiles")
                    .select("name, avatar_url")
                    .in("user_id", followersIds);

                if (followersError) {
                    console.error("Error al obtener detalles de seguidores:", followersError.message);
                    throw new Error(followersError.message);
                }

                setFollowers(followersDetails);
            } catch (error) {
                console.error("Error al obtener seguidores:", error);
                setErrorMessage("No se pudo cargar los seguidores.");
            }
        };

        fetchFollowers();
    }, [uuid, currentUser]);

    useEffect(() => {
        if (!currentUser || !userProfile) return;

        const checkIfFollowing = async () => {
            const { data, error } = await supabase
                .from("followers")
                .select("*")
                .eq("follower_id", currentUser.id)
                .eq("followed_id", uuid);

            if (error) {
                console.error("Error al verificar seguimiento:", error.message);
                return;
            }

            if (data && data.length > 0) {
                setIsFollowing(true); // El usuario ya sigue al perfil
            } else {
                setIsFollowing(false); // El usuario no sigue al perfil
            }
        };

        checkIfFollowing();
    }, [currentUser, userProfile, uuid]);

    const handleSaveDescription = async () => {
        if (!currentUser || !newDescription) return;

        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ description: newDescription })
                .eq("user_id", currentUser.id);

            if (error) {
                console.error("Error al guardar descripción:", error.message);
                setErrorMessage("Hubo un error al guardar la descripción.");
                return;
            }

            setUserProfile((prevProfile) => ({
                ...prevProfile,
                description: newDescription,
            }));

            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar descripción:", error);
            setErrorMessage("Hubo un error al guardar la descripción.");
        }
    };

    const openFollowersModal = () => {
        setIsFollowersModalOpen(true);
    };

    const closeFollowersModal = () => {
        setIsFollowersModalOpen(false);
    };

    const handleFollow = async () => {
        if (!currentUser || !uuid) return;

        try {
            const { data, error } = await supabase
                .from("followers")
                .insert([
                    {
                        follower_id: currentUser.id,
                        followed_id: uuid,
                    },
                ]);

            if (error) {
                console.error("Error al seguir:", error.message);
                return;
            }

            setIsFollowing(true); // Ahora el usuario sigue al perfil
            setFollowersCount(followersCount + 1); // Aumentar el contador de seguidores
        } catch (error) {
            console.error("Error al seguir:", error);
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (errorMessage) return <div>{errorMessage}</div>;

    const isOwnProfile = currentUser && currentUser.id === uuid;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
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
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Inicio
                    </button>
                    <button
                        onClick={() => router.push("/notes")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Notas
                    </button>
                    <button
                        onClick={() => router.push("/bdm")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Buzón de mensajes
                    </button>
                    <button
                        onClick={() => router.push("/advert")}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    >
                        Advertencias
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center mt-10 p-6 bg-gray-900 rounded-lg">
                <img
                    src={userProfile.avatar_url || "https://i.ibb.co/d0mWy0kP/perfildef.png"}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full mb-4"
                />
                <h1 className="text-3xl font-semibold">{userProfile.name}</h1>
                <div className="mt-4 text-lg text-gray-300">
                    <p><strong>Rol:</strong> {userProfile.role || "Sin rol asignado"}</p>
                </div>

                <div className="mt-4 text-lg text-gray-300">
                    {!isEditing ? (
                        <p>{userProfile.description || "Este usuario no ha agregado una descripción."}</p>
                    ) : (
                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full p-6 bg-gray-700 rounded-md h-55 resize-none"
                            placeholder="Escribe tu nueva descripción..."
                        />
                    )}
                </div>

                {isOwnProfile && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400"
                    >
                        Editar Descripción
                    </button>
                )}

                {isOwnProfile && isEditing && (
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handleSaveDescription}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {!isOwnProfile && !isFollowing && (
                    <button
                        onClick={handleFollow}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                    >
                        Seguir
                    </button>
                )}

                <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-300">
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={openFollowersModal}
                        >
                            {followersCount} {followersCount === 1 ? "seguidor" : "seguidores"}
                        </span>
                    </p>
                </div>

                {isFollowersModalOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
                        onClick={closeFollowersModal}
                    >
                        <div
                            className="bg-gray-900 p-6 rounded-lg w-96 max-h-[70vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Seguidores</h2>
                            <div className="overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
                                <ul className="space-y-4">
                                    {followers.map((follower, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <img
                                                src={follower.avatar_url || "https://i.ibb.co/d0mWy0kP/perfildef.png"}
                                                alt={follower.name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <span className="text-white">{follower.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={closeFollowersModal}
                                className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-gray-900 text-center text-sm text-gray-400 fixed bottom-0 w-full">
                <p>© 2025 Encantia. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default Perfil;
