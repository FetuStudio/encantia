import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase, getCdtsStatus } from '../utils/supabaseClient';

export default function MyApp({ Component, pageProps }) {
    const [isDisabled, setIsDisabled] = useState(false);
    const [cdtsCode, setCdtsCode] = useState('');
    const [motivo, setMotivo] = useState('');
    const [horaCaida, setHoraCaida] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            const { caida, cdtscode, motivo, hora_caida } = await getCdtsStatus();
            setIsDisabled(caida);
            setCdtsCode(caida ? cdtscode : '');
            setMotivo(caida ? motivo : '');
            setHoraCaida(caida && hora_caida ? new Date(hora_caida).toLocaleString() : '');
        };

        fetchStatus();

        // Escuchar cambios en tiempo real
        const subscription = supabase
            .from('cdts')
            .on('INSERT', fetchStatus)
            .on('UPDATE', fetchStatus)
            .on('DELETE', fetchStatus)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div className={isDisabled ? 'disabled-overlay' : ''}>
            {isDisabled ? (
                <div className="cdts-container">
                    <h1 className="glow">🚧 Sitio en Mantenimiento 🚧</h1>
                    <p className="cdts-message"><strong>{cdtsCode}</strong></p>
                    <p className="cdts-detail"><strong>Motivo:</strong> {motivo}</p>
                    <p className="cdts-detail"><strong>Hora de caída:</strong> {horaCaida}</p>
                </div>
            ) : (
                <Component {...pageProps} />
            )}

            <style jsx>{`
                /* 🖤 Tema Medianoche */
                .disabled-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, #1a1a1a 30%, #000000 100%);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    z-index: 1000;
                    transition: all 0.3s ease-in-out;
                }
                .cdts-container {
                    text-align: center;
                    padding: 40px;
                    background: rgba(30, 30, 30, 0.9);
                    border-radius: 15px;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                    animation: fadeIn 1s ease-in-out;
                }
                .glow {
                    font-size: 2rem;
                    font-weight: bold;
                    color: cyan;
                    text-shadow: 0 0 10px cyan, 0 0 20px cyan;
                }
                .cdts-message {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #00ffaa;
                    text-shadow: 0 0 5px #00ffaa;
                    margin-bottom: 10px;
                }
                .cdts-detail {
                    font-size: 1.1rem;
                    color: #bbb;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
