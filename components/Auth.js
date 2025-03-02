import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Auth() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [resetMessage, setResetMessage] = useState(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isPhoneSignIn, setIsPhoneSignIn] = useState(false);

    const handleSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
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
                email,
                password,
            });

            if (error) throw error;

            setIsRegistered(true);
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    const handlePasswordReset = async () => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
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

    // Phone sign in handler
    const handlePhoneSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone: phone,
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
                phone: phone,
                token: otp,
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
                    {isResettingPassword ? 'Restablecer Contraseña' : isSignUp ? 'Sign Up' : 'Sign In'}
                </h1>

                {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
                {resetMessage && <div className="text-green-500 text-center mb-4">{resetMessage}</div>}

                {isRegistered && (
                    <div className="text-yellow-500 text-center mb-4">
                        A verification email has been sent to {email}. Please check your inbox and confirm your email address.
                    </div>
                )}

                {isPhoneSignIn ? (
                    <div className="space-y-4">
                        <div className="field">
                            <label htmlFor="otp" className="text-sm">Enter OTP</label>
                            <input
                                type="text"
                                name="otp"
                                className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                placeholder="OTP"
                            />
                        </div>
                        <button
                            className="w-full p-3 mt-5 rounded-lg bg-black text-white hover:bg-gray-700 transition-colors"
                            onClick={handleOtpVerification}
                        >
                            Verify OTP
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isSignUp ? (
                            <div className="field">
                                <label htmlFor="phone" className="text-sm">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                    onChange={(e) => setPhone(e.target.value)}
                                    value={phone}
                                    placeholder="Phone number"
                                />
                            </div>
                        ) : (
                            <div className="field">
                                <label htmlFor="email" className="text-sm">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    placeholder="Email"
                                />
                            </div>
                        )}

                        {!isSignUp && (
                            <div className="field">
                                <label htmlFor="password" className="text-sm">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-white glow-input"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    placeholder="Password"
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
                            onClick={isSignUp ? handleSignUp : handlePhoneSignIn}
                        >
                            {isSignUp ? 'Sign Up' : 'Sign In with Phone'}
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
                                    Already have an account?{' '}
                                    <span
                                        onClick={() => setIsSignUp(false)}
                                        className="text-blue-500 cursor-pointer"
                                    >
                                        Sign In
                                    </span>
                                </p>
                            ) : (
                                <p>
                                    Don't have an account?{' '}
                                    <span
                                        onClick={() => setIsSignUp(true)}
                                        className="text-blue-500 cursor-pointer"
                                    >
                                        Sign Up
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
