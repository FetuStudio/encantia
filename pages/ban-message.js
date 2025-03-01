import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function BanMessage() {
  const [banInfo, setBanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBanStatus = async () => {
      setLoading(true);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/");
        return;
      }

      // Buscar si el usuario está baneado en la base de datos
      const { data, error: banError } = await supabase
        .from("banned_users")  // Asegúrate de que esta tabla existe
        .select("ban_until")
        .eq("user_id", user.id)
        .single();

      if (banError) {
        console.error("Error checking ban status:", banError);
        router.push("/");
        return;
      }

      if (data?.ban_until) {
        const banUntil = new Date(data.ban_until);
        const now = new Date();

        if (banUntil > now) {
          setBanInfo(banUntil);
        } else {
          // Si ya pasó el tiempo de baneo, permitir acceso
          await supabase.from("banned_users").delete().eq("user_id", user.id);
          router.push("/");
        }
      } else {
        router.push("/");
      }

      setLoading(false);
    };

    checkBanStatus();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Calcular el tiempo restante del baneo
  const getRemainingTime = () => {
    if (!banInfo) return "";
    const now = new Date();
    const diff = banInfo - now;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) return <div className="text-white text-center">Cargando...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-2xl font-bold">🚫 Estás baneado</h1>
      <p className="text-lg mt-2">No tienes acceso al sistema.</p>
      <p className="text-lg mt-2">{banInfo ? `Tiempo restante: ${getRemainingTime()}` : ""}</p>

      <button
        className="mt-6 p-2 bg-red-600 text-white rounded w-32"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
