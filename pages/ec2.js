import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function ElitecraftTeams() {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [authenticatedTeam, setAuthenticatedTeam] = useState(null);
    const router = useRouter();

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
        }
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
                            <button onClick={() => router.push(`/chat?team=${authenticatedTeam.id}`)} className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-400">Chat</button>
                            <button onClick={() => router.push(`/upload?team=${authenticatedTeam.id}`)} className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-400">Subir Archivos</button>
                            <button onClick={() => router.push(`/video?team=${authenticatedTeam.id}`)} className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-400">Subir Video</button>
                            <button onClick={() => router.push(`/call?team=${authenticatedTeam.id}`)} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-400">Llamada</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
