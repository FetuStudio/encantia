import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Chat() {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return;
            setUser(user);

            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!error) setRole(data?.role);
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => setShowLogoutModal(true);

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleSearchContact = async (email) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error) setError('Usuario no encontrado');
        else setContacts([data]);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedContact) return;

        const { error } = await supabase.from('messages').insert({
            from_user: user.id,
            to_user: selectedContact.id,
            message
        });

        if (!error) {
            setChatMessages([...chatMessages, { from_user: user.id, message }]);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white relative">
            <div className="flex justify-between items-center mb-4">
                <img src="https://images.encantia.lat/encantia-logo-2025.webp" alt="Logo" className="h-16" />
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = "https://www.encantia.lat/"} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Inicio</button>
                    <button onClick={() => router.push('/EventsArea')} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Eventos</button>
                    <button onClick={() => router.push('/chat')} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Chat</button>
                    <button onClick={() => router.push('/libros')} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Libros</button>
                    <button onClick={() => window.open("https://discord.gg/dxcX8S3mrF", "_blank")} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Discord</button>
                </div>
            </div>

            <div className="flex gap-6">
                <div className="w-1/3 bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-red-500">CHAT EN DESARROLLO</h2>
                    <input type="email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Buscar por email" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" />
                    <button onClick={() => handleSearchContact(searchEmail)} className="w-full p-2 bg-blue-500 text-white rounded-lg">Buscar</button>
                    {error && <div className="mt-2 text-red-500">{error}</div>}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">Contactos Disponibles</h3>
                        <ul>
                            {contacts.map((contact) => (
                                <li key={contact.id} className="cursor-pointer hover:bg-gray-700 p-2 rounded mt-2" onClick={() => setSelectedContact(contact)}>{contact.email}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="w-2/3 bg-gray-800 p-4 rounded-lg">
                    {selectedContact ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Chat con {selectedContact.email}</h2>
                            <div className="h-96 overflow-y-scroll mb-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`p-2 mb-2 rounded-lg ${msg.from_user === user.id ? 'bg-blue-500 self-end' : 'bg-gray-600'}`}>{msg.message}</div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe un mensaje..." className="w-full p-2 rounded bg-gray-700 text-white" />
                                <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded">Enviar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">Selecciona un contacto para chatear</div>
                    )}
                </div>
            </div>
        </div>
    );
}
