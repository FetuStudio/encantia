import { useState } from 'react'; 
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router'; 

export default function Auth() {
    const router = useRouter(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null); 
    const [isSignUp, setIsSignUp] = useState(false); // Para alternar entre registro e inicio de sesión
    const [isRegistered, setIsRegistered] = useState(false); // Estado para verificar si el usuario está registrado pero necesita confirmar su correo

    // Función para manejar el inicio de sesión
    const handleSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Redirigir siempre a la página principal después del inicio de sesión
            router.push("https://encantia.lat/"); 
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    // Función para manejar el registro de un nuevo usuario
    const handleSignUp = async () => {
        try {
            const { user, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Después del registro exitoso, indicamos que el correo necesita ser verificado
            setIsRegistered(true);
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border-4 border-blue-500 bg-opacity-20 glow-border">
                <h1 className="text-2xl font-semibold text-center mb-6">
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </h1>

                {/* Mostrar el mensaje de error si existe */}
                {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

                {/* Mostrar mensaje de confirmación de correo si es necesario */}
                {isRegistered && (
                    <div className="text-yellow-500 text-center mb-4">
                        A verification email has been sent to {email}. Please check your inbox and confirm your email address.
                    </div>
                )}

                <div className="space-y-4">
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

                    <button
                        className="w-full p-3 mt-5 rounded-lg bg-900 text-white hover:bg-gray-700 transition-colors"
                        onClick={isSignUp ? handleSignUp : handleSignIn} // Usar la función correspondiente según el estado
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>

                    {/* Enlace para cambiar entre Sign In y Sign Up */}
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
            </div>
        </div>
    );
}
