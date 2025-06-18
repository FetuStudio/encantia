import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function AvisoAdmin() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "info", active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError("No has iniciado sesión.");
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileData || profileError) {
        setError("No se pudo cargar tu perfil.");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData.role !== "Creador") {
        setError("No tienes permisos para ver esta página.");
        setLoading(false);
        return;
      }

      // Cargar alerta actual
      const { data: currentAlert } = await supabase
        .from("alerts")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (currentAlert) {
        setAlert(currentAlert);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from("alerts")
      .upsert([alert], { onConflict: ['id'] });

    if (error) {
      setError("Error al guardar: " + error.message);
    } else {
      alert("Aviso guardado correctamente.");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Cargando...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">{error}</div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center px-4">
      {/* Título */}
      <h1 className="text-2xl font-bold mt-8 mb-4">Panel de Aviso Global</h1>

      {/* Formulario */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl space-y-4">
        <label className="block">
          <span className="text-sm text-gray-300">Mensaje del aviso</span>
          <textarea
            className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
            rows={4}
            value={alert.message}
            onChange={(e) => setAlert({ ...alert, message: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-300">Tipo de aviso</span>
          <select
            className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
            value={alert.type}
            onChange={(e) => setAlert({ ...alert, type: e.target.value })}
          >
            <option value="info">Info</option>
            <option value="success">Éxito</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>
        </label>

        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox text-blue-500"
            checked={alert.active}
            onChange={(e) => setAlert({ ...alert, active: e.target.checked })}
          />
          <span className="ml-2 text-sm">Activo</span>
        </label>

        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-semibold"
          onClick={handleSave}
        >
          Guardar aviso
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-3 text-gray-400 text-xs bg-gray-900 p-2 rounded-md shadow-md">
        © 2025 by Encantia is licensed under CC BY-NC-ND 4.0.
      </div>
    </div>
  );
}
