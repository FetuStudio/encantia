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
        <div className="sigin max-w-sm m-auto border border-gray-500 rounded p-4 mt-4">
            <h1 className="text-center">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

            {/* Mostrar el mensaje de error si existe */}
            {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}

            {/* Mostrar mensaje de confirmación de correo si es necesario */}
            {isRegistered && (
                <div className="text-yellow-500 text-center mb-4">
                    A verification email has been sent to {email}. Please check your inbox and confirm your email address.
                </div>
            )}

            <div className="field mt-3">
                <label htmlFor="email" className="text-gray-800 w-full block text-sm">Email</label>
                <input
                    type="email"
                    name="email"
                    className="p-1 border border-gray-500 w-full rounded"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
            </div>

            <div className="field mt-3">
                <label htmlFor="password" className="text-gray-800 w-full block text-sm">Password</label>
                <input
                    type="password" 
                    name="password"
                    id="password"
                    className="p-1 border border-gray-500 w-full rounded"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
            </div>

            <button
                className="border p-2 w-full mt-5 rounded bg-black text-white"
                onClick={isSignUp ? handleSignUp : handleSignIn} // Usar la función correspondiente según el estado
            >
                {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            {/* Enlace para cambiar entre Sign In y Sign Up */}
            <div className="mt-3 text-center">
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
    );
}
