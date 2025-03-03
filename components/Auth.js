import { useState } from "react"; 
import { supabase } from "../utils/supabaseClient"; 
import { useRouter } from "next/router"; 

export default function Register() {
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState(""); // Nombre para mostrar
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Función para verificar que el nombre de usuario es único
    const checkUsernameUnique = async (username) => {
        const { data, error } = await supabase
            .from("users") // Tabla de usuarios
            .select("id")
            .eq("username", username); // Comprobar si el nombre de usuario ya está en la base de datos

        if (error) {
            console.error("Error checking username:", error);
            return false;
        }

        return data.length === 0; // Si no se encuentran resultados, el nombre de usuario es único
    };

    // Función para verificar si el nombre para mostrar ya está en uso
    const checkDisplayNameUnique = async (displayName) => {
        const { data, error } = await supabase
            .from("users") // Tabla de usuarios
            .select("id")
            .eq("display_name", displayName); // Comprobar si el nombre para mostrar ya está en la base de datos

        if (error) {
            console.error("Error checking display name:", error);
            return false;
        }

        return data.length === 0; // Si no se encuentran resultados, el nombre para mostrar es único
    };

    // Función para registrar un usuario
    const handleRegister = async () => {
        setError("");
        setLoading(true);

        // Validaciones: Nombre de usuario y Nombre para mostrar obligatorios
        if (!username || !displayName) {
            setError("El nombre de usuario y el nombre para mostrar son obligatorios.");
            setLoading(false);
            return;
        }

        // Verificar si el nombre de usuario es único
        const isUsernameUnique = await checkUsernameUnique(username);
        if (!isUsernameUnique) {
            setError("El nombre de usuario ya está en uso.");
            setLoading(false);
            return;
        }

        // Verificar si el nombre para mostrar es único
        const isDisplayNameUnique = await checkDisplayNameUnique(displayName);
        if (!isDisplayNameUnique) {
            setError("El nombre para mostrar ya está en uso.");
            setLoading(false);
            return;
        }

        // Crear usuario con email y password en Supabase
        const { user, error: signupError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
            return;
        }

        // Si el usuario se registró correctamente, almacenar el username y el display_name
        const { error: insertError } = await supabase
            .from("users")
            .insert([{ id: user.id, username, display_name: displayName }]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        // Si el registro es exitoso, redirigir al usuario
        router.push("/dashboard");  // Redirige al dashboard o al lugar que quieras
    };

    // Función para intentar hacer login si el usuario ya existe
    const handleLogin = async () => {
        setError("");
        setLoading(true);

        const { user, error: loginError } = await supabase.auth.signIn({
            email,
            password,
        });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
            return;
        }

        // Si el login es exitoso, redirigir al usuario
        router.push("/dashboard");  // Redirige al dashboard o al lugar que quieras
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl mb-6">Registro / Login</h1>

            <div className="w-full max-w-sm">
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {/* Campo para el nombre de usuario */}
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    className="mb-4 p-2 w-full rounded-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                {/* Campo para el nombre para mostrar */}
                <input
                    type="text"
                    placeholder="Nombre para mostrar"
                    className="mb-4 p-2 w-full rounded-lg"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
                
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="mb-4 p-2 w-full rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    className="mb-4 p-2 w-full rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleRegister}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Registrando..." : "Registrarse"}
                </button>

                <div className="text-center mt-4">
                    <span>¿Ya tienes una cuenta?</span>
                    <button
                        onClick={handleLogin}
                        className="text-blue-500 hover:text-blue-400"
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
