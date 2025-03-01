import { useState } from 'react'; 
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router'; 

export default function Auth() {
    const router = useRouter(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null); 

    
    const handleSignIn = async () => {
        try {
            const { user, session, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            
            router.push("/user-area"); 
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    return (
        <div className="sigin max-w-sm m-auto border border-gray-500 rounded p-4 mt-4">
            <h1 className="text-center">Sign In</h1>

            {/* Mostrar el mensaje de error si existe */}
            {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}

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
                onClick={handleSignIn}
            >
                Sign In
            </button>
        </div>
    );
}
