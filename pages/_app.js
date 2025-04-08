import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { MusicProvider } from '../context/MusicContext';
import { getCdtsStatus } from '../utils/supabaseClient';

export default function MyApp({ Component, pageProps }) {
    const [isDisabled, setIsDisabled] = useState(false);
    const [cdtsCode, setCdtsCode] = useState('');
    const [motivo, setMotivo] = useState('');
    const [horaCaida, setHoraCaida] = useState('');
    const [mdlcMessage, setMdlcMessage] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            const { caida, cdtscode, motivo, hora_caida, mdlc } = await getCdtsStatus();

            setIsDisabled(caida);
            setCdtsCode(caida ? cdtscode : '');
            setMotivo(caida ? motivo : '');
            setHoraCaida(caida ? new Date(hora_caida).toLocaleString() : '');
            setMdlcMessage(caida ? mdlc : 'Sitio en Mantenimiento');
        };

        fetchStatus();
    }, []); // Solo se ejecuta una vez cuando el componente se monta

    return (
        <MusicProvider>
            <div className={isDisabled ? 'disabled-overlay' : ''}>
                {isDisabled ? (
                    <div className="cdts-container">
                        <h1>{mdlcMessage}</h1>
                        <p><strong>Código de mantenimiento:</strong> {cdtsCode}</p>
                        <p><strong>Motivo:</strong> {motivo}</p>
                        <p><strong>Hora de Caída:</strong> {horaCaida}</p>
                    </div>
                ) : (
                    <Component {...pageProps} />
                )}
            </div>

            <style jsx>{`
                /* Estilos para la ventana emergente de mantenimiento */
                .disabled-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    z-index: 1000;
                    text-align: center;
                }

                .cdts-container {
                    background: linear-gradient(135deg, #2c3e50, #34495e);
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7);
                    max-width: 500px;
                    width: 100%;
                    color: #ecf0f1;
                    font-size: 1.2rem;
                }

                h1 {
                    font-size: 2rem;
                    color: #e74c3c;
                }
            `}</style>
        </MusicProvider>
    );
}
