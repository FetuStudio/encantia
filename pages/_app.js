import Styles from '../styles/globals'
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
            setHoraCaida(caida ? new Date(hora_caida).toLocaleString() : '');
        };

        fetchStatus();

        // Escuchar cambios en la tabla 'cdts' en tiempo real
        const subscription = supabase
            .channel('realtime:cdts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cdts' }, fetchStatus)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div className={isDisabled ? 'disabled-overlay' : ''}>
            {isDisabled ? (
                <div className="cdts-container">
                    <h1>Sitio en mantenimiento</h1>
                    <p><strong>{cdtsCode}</strong></p>
                    <p><strong>Motivo:</strong> {motivo}</p>
                    <p><strong>Hora de caída:</strong> {horaCaida}</p>
                </div>
            ) : (
                <Component {...pageProps} />
            )}

            <style jsx>{`
                .disabled-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    z-index: 1000;
                }
                .cdts-container {
                    text-align: center;
                    padding: 20px;
                    background: #222;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
