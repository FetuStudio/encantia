import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState({
    displayName: "",
    avatarUrl: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    setLoading(true);
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) console.error(userError);

    const userId = user?.user?.id;
    const email = user?.user?.email; // Obtener el correo del usuario autenticado

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) console.error(error);
    else
      setProfile({
        displayName: data.display_name || "",
        avatarUrl: data.avatar_url || "",
        email: email, // Mantener el correo siempre actualizado
      });

    setLoading(false);
  }

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();

    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        updated_at: new Date(),
      })
      .eq("id", user?.user?.id);

    if (dbError) console.error(dbError);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Perfil</h1>

        <div className="flex flex-col items-center">
          <img
            src={profile.avatarUrl || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="w-24 h-24 rounded-full border border-gray-300 shadow-sm"
          />
        </div>

        <form onSubmit={updateProfile} className="mt-4 space-y-4">
          <div>
            <label className="block text-gray-700">Nombre</label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Foto (URL)</label>
            <input
              type="text"
              value={profile.avatarUrl}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="mt-1 w-full p-2 border bg-gray-100 rounded-lg cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
