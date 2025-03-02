import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Chat() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
                return;
            }
            setUser(user);
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user) {
            fetchContacts();
            fetchChatMessages();
        }
    }, [user]);

    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('email, id')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching contacts:', error);
        } else {
            setContacts(data);
        }
    };

    const fetchChatMessages = async () => {
        if (selectedContact) {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
                .or(`from_user.eq.${selectedContact.id},to_user.eq.${selectedContact.id}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching chat messages:', error);
            } else {
                setChatMessages(data);
            }
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() && selectedContact) {
            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        from_user: user.id,
                        to_user: selectedContact.id,
                        message,
                    },
                ]);

            if (error) {
                console.error('Error sending message:', error);
            } else {
                setMessage('');
                fetchChatMessages();
            }
        }
    };

    const handleSearchContact = async (email) => {
        setError(null); // Limpiar mensaje de error
        email = email.trim(); // Eliminar espacios

        if (!email) {
            setError('Por favor, ingrese un correo válido');
            return;
        }

        try {
            // Buscar el correo en los usuarios registrados utilizando supabase.auth.api
            const { data, error } = await supabase.auth.admin.listUsers({
                filter: `email.eq.${email}`,
            });

            if (error) {
                setError('Correo no encontrado. Intenta nuevamente.');
                console.error('Error fetching contact:', error);
            } else {
                if (data.length > 0) {
                    // Si se encuentra el contacto, establecerlo como el contacto seleccionado
                    const foundUser = data[0];
                    setSelectedContact({ id: foundUser.id, email: foundUser.email });
                    fetchChatMessages();
                } else {
                    setError('Correo no encontrado. Intenta nuevamente.');
                }
            }
        } catch (err) {
            console.error("Error de consulta en Supabase:", err);
            setError('Hubo un error en la búsqueda. Intenta nuevamente.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">

            {/* Navbar */}
            <div className="flex justify-between items-center p-4 bg-gray-900">
                <div className="flex items-center">
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

                    {/* Botón de "Crear Libro" */}
                    <button
                        className="p-2 bg-green-600 text-white rounded"
                        onClick={() => router.push('/crear-libro')}
                    >
                        Crear Libro
                    </button>
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
