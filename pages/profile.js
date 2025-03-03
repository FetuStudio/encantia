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
    getUserEmail();
    getProfile();
  }, []);

  async function getUserEmail() {
    const { data: user, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error obteniendo el usuario:", error);
      return;
    }
    setProfile((prevProfile) => ({ ...prevProfile, email: user?.user?.email || "" }));
  }

  async function getProfile() {
    setLoading(true);
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error obteniendo el usuario:", userError);
      return;
    }

    const userId = user?.user?.id;
    if (!userId) return;

    // Buscar el perfil en la base de datos
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      // Si el perfil no existe, creamos uno nuevo
      if (error.code === "PGRST116") {
        console.log("Perfil no encontrado, creando...");
        await createProfile(userId);
      } else {
        console.error("Error obteniendo perfil:", error);
      }
      return;
    }

    // Si se encontró el perfil, lo actualizamos
    setProfile({
      displayName: data.display_name || "",
      avatarUrl: data.avatar_url || "",
      email: profile.email, // Ya tenemos el correo electrónico
    });

    setLoading(false);
  }

  // Función para crear un perfil si no existe
  async function createProfile(userId) {
    const { error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          display_name: "Nuevo Usuario", // Valor por defecto
          avatar_url: "https://via.placeholder.com/150", // Avatar por defecto
        },
      ]);

    if (error) {
      console.error("Error creando perfil:", error);
    } else {
      console.log("Perfil creado con éxito");
      setProfile({
        displayName: "Nuevo Usuario",
        avatarUrl: "https://via.placeholder.com/150",
        email: profile.email, // Mantener el correo
      });
    }

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

    if (dbError) {
      console.error("Error actualizando perfil:", dbError);
    }

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
