import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase, getCdtsStatus } from '../utils/supabaseClient';

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
            setMdlcMessage(caida ? mdlc : 'Sitio en Mantenimiento'); // Mensaje por defecto si no hay 'mdlc'
        };

        fetchStatus();
    }, []); // Solo se ejecuta una vez cuando el componente se monta

    return (
        <div className={isDisabled ? 'disabled-overlay' : ''}>
            {isDisabled ? (
                <div className="cdts-container">
                    <h1>{mdlcMessage}</h1> {/* Usamos el mensaje de 'mdlc' */}
                    <p><strong>Código de mantenimiento:</strong> {cdtsCode}</p>
                    <p><strong>Motivo:</strong> {motivo}</p>
                    <p><strong>Hora de Caída:</strong> {horaCaida}</p>
                </div>
            ) : (
                <Component {...pageProps} />
            )}

            <style jsx>{`
                /* Importamos fuente moderna */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif; /* Usamos la fuente Poppins */
                }

                body {
                    background-color: #121212; /* Fondo oscuro */
                    color: #fff; /* Texto blanco */
                    font-size: 16px;
                    line-height: 1.5;
                }

                /* Overlay cuando el sitio está deshabilitado */
                .disabled-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9); /* Fondo semitransparente */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    z-index: 1000;
                    text-align: center;
                }

                /* Estilo de la caja de mantenimiento */
                .cdts-container {
                    background: linear-gradient(135deg, #2c3e50, #34495e); /* Fondo degradado */
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.7);
                    max-width: 500px;
                    width: 100%;
                    color: #ecf0f1;
                    font-size: 1.2rem;
                    transition: all 0.3s ease-in-out;
                    transform: translateY(-50px);
                }

                /* Animación suave para la caja */
                .cdts-container {
                    animation: fadeIn 0.8s ease-out forwards;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                h1 {
                    font-size: 2rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
                    color: #e74c3c; /* Color para el título */
                }

                p {
                    margin: 10px 0;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
                    font-size: 1.1rem;
                    letter-spacing: 0.5px;
                }

                strong {
                    color: #1abc9c; /* Verde azulado para resaltar texto importante */
                }

                /* Hover para los textos */
                p:hover {
                    transform: scale(1.05);
                    transition: transform 0.3s ease-in-out;
                    color: #ecf0f1;
                }

                /* Estilo adicional para enlaces, si los necesitas */
                a {
                    color: #1abc9c;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                a:hover {
                    color: #16a085;
                }

                /* Agregar un botón de recarga con estilo */
                .reload-button {
                    padding: 10px 20px;
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.3s ease;
                }

                .reload-button:hover {
                    background-color: #c0392b;
                }

            `}</style>
        </div>
    );
}
