import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Chat() {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('');
    const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario
    const [showMenu, setShowMenu] = useState(false); // Estado para controlar el menú desplegable
    const router = useRouter();

        useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!error) {
                setRole(data?.role);
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (!profileError) {
                setUserProfile(profileData);
            }
        };

        const fetchEvents = async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (!error) {
                setEvents(data);
            }
        };

        fetchUserProfile();
        fetchEvents();
    }, []);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const toggleMenu = () => setShowMenu(!showMenu);

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo"
                        className="h-16"
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={() => window.location.href = "https://www.encantia.lat/"} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Inicio</button>
                    <button onClick={() => router.push('/EventsArea')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Eventos</button>
                    <button onClick={() => router.push('/chat')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Chat</button>
                    <button onClick={() => router.push('/libros')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Libros</button>
                    <button onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Discord</button>
                    <button onClick={() => router.push('/fg2')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Fetu Games 2</button>
                    {role === 'owner' && (
                        <button onClick={() => router.push('/crear-libro')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">Crear Libro</button>
                    )}
                </div>

                {userProfile && (
                    <div className="relative">
                        <img
                            src={userProfile.avatar_url || 'https://i.ibb.co/d0mWy0kP/perfildef.png'}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full cursor-pointer"
                            onClick={toggleMenu}
                        />
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                                <ul className="py-2">
                                    <li className="px-4 py-2 cursor-pointer hover:bg-gray-700" onClick={() => router.push('/settings')}>Configuración</li>
                                    <li className="px-4 py-2 cursor-pointer hover:bg-gray-700" onClick={() => router.push('/profile')}>Perfil</li>
                                    <li className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-700" onClick={handleLogout}>Cerrar sesión</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md">
                    <div className="bg-gray-900 text-white p-5 rounded-lg shadow-2xl text-center">
                        <p className="mb-4 text-lg font-semibold">¿Seguro que quieres cerrar sesión?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={confirmLogout} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-all">Sí</button>
                            <button onClick={() => setShowLogoutModal(false)} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all">No</button>
                        </div>
                    </div>
                </div>
            )}

                </div>
            </div>

            <div className="flex gap-6">
                {/* Barra lateral con la lista de contactos y búsqueda */}
                <div className="w-1/3 bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-red-500">CHAT EN DESARROLLO</h2>
                    <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Buscar por email"
                        className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                    />
                    <button
                        onClick={() => handleSearchContact(searchEmail)}
                        className="w-full p-2 bg-blue-500 text-white rounded-lg"
                    >
                        Buscar
                    </button>
                    {error && (
                        <div className="mt-2 text-red-500">{error}</div>
                    )}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Contactos Disponibles</h3>
                        <ul>
                            {contacts.map((contact) => (
                                <li
                                    key={contact.id}
                                    className="cursor-pointer hover:bg-gray-700 p-2 rounded mt-2"
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    {contact.email}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Chat con el contacto seleccionado */}
                <div className="w-2/3 bg-gray-800 p-4 rounded-lg">
                    {selectedContact ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Chat con {selectedContact.email}</h2>
                            <div className="h-96 overflow-y-scroll mb-4">
                                {chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-2 mb-2 rounded-lg ${msg.from_user === user.id ? 'bg-blue-500 self-end' : 'bg-gray-600'}`}
                                    >
                                        {msg.message}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            Selecciona un contacto para chatear
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

