import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';
import Adsense from "../components/Adsense";

export default function Auth() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingGifVisible, setIsLoadingGifVisible] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const dominiosRestringidos = ['gmail.com', 'outlook.com', 'outlook.es', 'hotmail.com'];

    const handleSignIn = async () => {
        setLoading(true);
        setErrorMessage(null);
        setIsLoadingGifVisible(true);

        const dominioEmail = email.split('@')[1];
        if (dominioEmail === 'encantia.lat') {
            setErrorMessage('No se permite el correo de tipo @encantia.lat en el inicio de sesión. Este correo es exclusivo para el acceso de administradores.');
            setLoading(false);
            setIsLoadingGifVisible(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
            setIsLoadingGifVisible(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setErrorMessage(null);
        setIsLoadingGifVisible(true);

        const dominioEmail = email.split('@')[1];
        if (dominioEmail === 'encantia.lat') {
            setErrorMessage('No se permite el correo de tipo @encantia.lat para el registro. Este correo es exclusivo para el acceso de administradores.');
            setLoading(false);
            setIsLoadingGifVisible(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
            setIsLoadingGifVisible(false);
        }
    };

    return (
        <div className="bg-gray-900 h-screen flex items-center justify-center relative">
            {errorMessage && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-black p-3 rounded shadow-lg transition-transform duration-500 ease-in-out animate-slide-down flex justify-between items-center">
                    <span>{errorMessage}</span>
                    <button
                        className="ml-4 font-bold hover:bg-gray-300 px-2 rounded"
                        onClick={() => setErrorMessage(null)}
                    >
                        X
                    </button>
                </div>
            )}

            <div className="max-w-sm w-full border border-gray-700 rounded p-6 bg-gray-800">
                <div className="flex justify-center mb-4">
                    <img
                        src="https://images.encantia.lat/encantia-logo-2025.webp"
                        alt="Logo de Encatia"
                        className="h-25"
                    />
                </div>
                <h1 className="text-center text-white text-2xl">
                    {isSignUp ? "Registrarse" : "Iniciar sesión"}
                </h1>

                <div className="field mt-4">
                    <label htmlFor="email" className="text-white block text-sm">Correo electrónico</label>
                    <div className="flex items-center">
                        <input
                            type="email"
                            className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="Correo electrónico"
                        />
                        <img
                            src="https://images.encantia.lat/email.png"
                            alt="Correo electrónico icono"
                            className="w-6 h-6 ml-2"
                        />
                    </div>
                </div>

                <div className="field mt-4">
                    <label htmlFor="password" className="text-white block text-sm">Contraseña</label>
                    <div className="flex items-center">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            className="p-2 border border-gray-600 w-full rounded bg-gray-700 text-white placeholder-gray-400"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Contraseña"
                        />
                        <img
                            src="https://images.encantia.lat/password.png"
                            alt="Contraseña icono"
                            className="w-6 h-6 ml-2"
                        />
                        <button
                            type="button"
                            className="ml-2 text-white"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            <img
                                src={passwordVisible ? "https://images.encantia.lat/upass.png" : "https://images.encantia.lat/vpass.png"}
                                alt={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                </div>

                <button
                    className="border p-2 w-full mt-5 rounded bg-blue-600 text-white relative"
                    onClick={isSignUp ? handleSignUp : handleSignIn}
                    disabled={loading}
                >
                    {!loading ? (isSignUp ? 'Registrarse' : 'Iniciar sesión') : ' '}
                    {loading && (
                        <img
                            src="https://images.encantia.lat/loading.gif"
                            alt="Cargando..."
                            className="absolute inset-0 w-6 h-6 m-auto"
                        />
                    )}
                </button>

                <div className="mt-4 text-center">
                    {isSignUp ? (
                        <p className="text-white text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="text-blue-500 hover:underline"
                            >
                                Iniciar sesión
                            </button>
                        </p>
                    ) : (
                        <>
                            <p className="text-white text-sm">
                                ¿No tienes una cuenta?{" "}
                                <button
                                    onClick={() => setIsSignUp(true)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Registrate aquí
                                </button>
                            </p>
                            <p className="text-white text-sm mt-2">
                                ¿Eres admin?{" "}
                                <a
                                    href="https://admin.encantia.lat/"
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Haz click aquí
                                </a>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Buy Me a Coffee botón personalizado */}
            <a
                href="https://buymeacoffee.com/encantiaesp"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-20 left-4 z-50 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-full shadow-lg flex items-center gap-2"
            >
                <img
                    src="https://vectorseek.com/wp-content/uploads/2023/08/Buy-Me-A-Coffee-Logo-Vector.svg-.png"
                    alt="Buy me a coffee"
                    className="w-5 h-5"
                />
                Buy me a coffee
            </a>

            {/* Ko-fi botón */}
            <a
                href="https://ko-fi.com/S6S71EQT6F"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 left-4 z-50"
            >
                <img
                    height="36"
                    style={{ border: 0, height: '36px' }}
                    src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                    alt="Support me on Ko-fi at ko-fi.com"
                />
            </a>
        </div>
    );
}
