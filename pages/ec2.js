import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ElitecraftTeams() {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [authenticatedTeam, setAuthenticatedTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            const { data, error } = await supabase.from('teams_ec2').select('id, team');
            if (error) {
                console.error('Error fetching teams:', error);
            } else {
                setTeams(data);
            }
        };
        fetchTeams();
    }, []);

    const handlePasswordSubmit = async () => {
        if (!selectedTeam) return;

        const { data, error } = await supabase
            .from('teams_ec2')
            .select('password')
            .eq('id', selectedTeam.id)
            .single();

        if (error || !data || data.password !== passwordInput) {
            alert('Contraseña incorrecta');
        } else {
            setAuthenticatedTeam(selectedTeam);
            fetchMessages(selectedTeam.id);
            subscribeToMessages(selectedTeam.id);
        }
    };

    const fetchMessages = async (teamId) => {
        const { data, error } = await supabase
            .from('team_messages')
            .select('id, message, created_at')
            .eq('team_id', teamId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !authenticatedTeam) return;

        const { error } = await supabase
            .from('team_messages')
            .insert([{ team_id: authenticatedTeam.id, message: newMessage }]);

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
    };

    const subscribeToMessages = (teamId) => {
        const subscription = supabase
            .channel('team_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `team_id=eq.${teamId}` }, (payload) => {
                setMessages((prevMessages) => [...prevMessages, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    return (
        <div className="flex flex-col h-screen px-6 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold">Elitecraft 2 - Equipos</h1>
            </div>
            <div className="flex-grow">
                {!authenticatedTeam ? (
                    <div>
                        <h2 className="text-xl mb-4">Selecciona un equipo:</h2>
                        {teams.map((team) => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team)}
                                className="block bg-blue-500 px-4 py-2 my-2 rounded-lg hover:bg-blue-400"
                            >
                                {team.team}
                            </button>
                        ))}
                        {selectedTeam && (
                            <div className="mt-4">
                                <input
                                    type="password"
                                    placeholder="Ingrese la contraseña"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="px-2 py-1 text-black rounded"
                                />
                                <button
                                    onClick={handlePasswordSubmit}
                                    className="ml-2 px-4 py-1 bg-green-500 rounded-lg hover:bg-green-400"
                                >
                                    Acceder
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl">Bienvenido al equipo {authenticatedTeam.team}</h2>
                        <div className="mt-4 flex gap-4">
                            <button onClick={() => setAuthenticatedTeam(null)} className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-400">Salir</button>
                        </div>
                        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-xl mb-2">Chat del equipo</h3>
                            <div className="h-60 overflow-y-auto border border-gray-700 p-2 mb-2">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="text-gray-300 text-sm">
                                        {msg.message}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje"
                                    className="flex-grow px-2 py-1 text-black rounded"
                                />
                                <button onClick={sendMessage} className="px-4 py-1 bg-green-500 rounded-lg hover:bg-green-400">Enviar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
