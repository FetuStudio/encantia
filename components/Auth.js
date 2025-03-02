import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Auth() {
    const router = useRouter();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [resetMessage, setResetMessage] = useState(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isPhoneSignIn, setIsPhoneSignIn] = useState(false);

    const handleSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email: emailOrPhone,
                password,
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    const handleSignUp = async () => {
        try {
            const { user, error } = await supabase.auth.signUp({
                email: emailOrPhone,
                password,
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    const handlePasswordReset = async () => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(emailOrPhone);
            if (error) throw error;
            setResetMessage("Se ha enviado un correo para restablecer tu contraseña.");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Google login handler
    const handleGoogleSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // GitHub login handler
    const handleGitHubSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Discord login handler
    const handleDiscordSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Twitch login handler
    const handleTwitchSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithOAuth({
                provider: 'twitch',
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Phone sign in handler (using OTP)
    const handlePhoneSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: emailOrPhone,
            });

            if (error) throw error;

            setIsPhoneSignIn(true);
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Verify OTP
    const handleOtpVerification = async () => {
        try {
            const { user, session, error } = await supabase.auth.verifyOtp({
                phone: emailOrPhone,
                token: otp,
                type: 'sms', // Tipo de verificación
            });

            if (error) throw error;

            router.push("https://encantia.lat/");
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border-4 border-blue-500 bg-opacity-20 glow-border">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    {isResettingPassword ? 'Restablecer Contraseña' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                </h1>

                {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
                {resetMessage && <div className="text-green-500 text-center mb-4">{resetMessage}</div>}

                {isResettingPassword ? (
                    <div className="space-y-4">
                        <div className="field">
                            <label htmlFor="reset-email" className="text-sm">Email or Phone</label>
                            <input
                                type="text"
                                name="reset-email"
                                className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                value={emailOrPhone}
                                placeholder="Email or Phone"
                            />
                        </div>
                        <button
                            className="w-full p-3 mt-5 rounded-lg bg-black text-white hover:bg-gray-700 transition-colors"
                            onClick={handlePasswordReset}
                        >
                            Restablecer Contraseña
                        </button>
                        <div className="text-center mt-3 text-sm">
                            <span
                                onClick={() => setIsResettingPassword(false)}
                                className="text-blue-500 cursor-pointer"
                            >
                                Volver al inicio de sesión
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="field">
                            <label htmlFor="emailOrPhone" className="text-sm">Email or Phone</label>
                            <input
                                type="text"
                                name="emailOrPhone"
                                className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                value={emailOrPhone}
                                placeholder="Email or Phone"
                            />
                        </div>

                        {!isPhoneSignIn && !isSignUp && (
                            <div className="field">
                                <label htmlFor="password" className="text-sm">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    placeholder="Contraseña"
                                />
                            </div>
                        )}

                        {isSignUp && (
                            <div className="field">
                                <label htmlFor="password" className="text-sm">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    placeholder="Contraseña"
                                />
                            </div>
                        )}

                        <div className="text-right text-sm">
                            <span
                                className="text-blue-500 cursor-pointer hover:underline"
                                onClick={() => setIsResettingPassword(true)}
                            >
                                ¿Se te olvidó la contraseña?
                            </span>
                        </div>

                        <button
                            className="w-full p-3 mt-5 rounded-lg bg-black text-white hover:bg-gray-700 transition-colors"
                            onClick={isSignUp ? handleSignUp : (isPhoneSignIn ? handleOtpVerification : handlePhoneSignIn)}
                        >
                            {isSignUp ? 'Registrarse' : (isPhoneSignIn ? 'Verificar OTP' : 'Iniciar Sesión')}
                        </button>

                        {/* Logos de Google, GitHub, Discord, Twitch */}
                        <div className="flex justify-center mt-4 space-x-4">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                                alt="Google Logo"
                                width="30"
                                height="30"
                                className="cursor-pointer"
                                onClick={handleGoogleSignIn}
                            />
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                                alt="GitHub Logo"
                                width="30"
                                height="30"
                                className="cursor-pointer"
                                onClick={handleGitHubSignIn}
                            />
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/56/Discord_logo_2015.svg"
                                alt="Discord Logo"
                                width="30"
                                height="30"
                                className="cursor-pointer"
                                onClick={handleDiscordSignIn}
                            />
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Twitch_logo_2019.svg"
                                alt="Twitch Logo"
                                width="30"
                                height="30"
                                className="cursor-pointer"
                                onClick={handleTwitchSignIn}
                            />
                        </div>

                        <div className="text-center mt-3 text-sm">
                            {isSignUp ? (
                                <p>
                                    ¿Ya tienes cuenta?{' '}
                                    <span
                                        onClick={() => setIsSignUp(false)}
                                        className="text-blue-500 cursor-pointer"
                                    >
                                        Iniciar sesión
                                    </span>
                                </p>
                            ) : (
                                <p>
                                    ¿No tienes cuenta?{' '}
                                    <span
                                        onClick={() => setIsSignUp(true)}
                                        className="text-blue-500 cursor-pointer"
                                    >
                                        Regístrate
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
