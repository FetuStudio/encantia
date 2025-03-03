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

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.user?.id)
      .single();

    if (error) console.error(error);
    else setProfile({ 
      displayName: data.display_name || "", 
      avatarUrl: data.avatar_url || "", 
      email: data.email || "" 
    });

    setLoading(false);
  }

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();

    // Actualizar email en Auth
    const { error: authError } = await supabase.auth.updateUser({ email: profile.email });
    if (authError) console.error(authError);

    // Actualizar datos en DB
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        email: profile.email,
        updated_at: new Date(),
      })
      .eq("id", user?.user?.id);

    if (dbError) console.error(dbError);
    setLoading(false);
  }

  return (
    <div className="container">
      <h1>Perfil</h1>
      <form onSubmit={updateProfile}>
        <label>
          Nombre:
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          />
        </label>
        <label>
          Foto URL:
          <input
            type="text"
            value={profile.avatarUrl}
            onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
