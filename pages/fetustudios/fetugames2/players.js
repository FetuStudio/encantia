import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAvatarUrl("");
        setProfileComplete(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, name")
        .eq("user_id", user.id)
        .single();

      if (!profile || !profile.avatar_url || !profile.name) {
        setProfileComplete(false);
        setAvatarUrl("");
      } else {
        setProfileComplete(true);
        setAvatarUrl(profile.avatar_url);
      }
    }

    async function fetchJugadores() {
      const { data, error } = await supabase
        .from("jugadores")
        .select("players, estado, numero")
        .order("numero", { ascending: true });

      if (!error) {
        setJugadores(data);
      } else {
        console.error("Error al cargar jugadores:", error.message);
      }
    }

    fetchProfile();
    fetchJugadores();
  }, [router]);

  if (profileComplete === null) return null;

  if (!profileComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-4">¡No puedes ver el contenido de esta página!</h1>
        <p className="mb-6 text-center max-w-md">
          Para acceder a esta sección debes tener configurado tu nombre de usuario y foto de perfil.
        </p>
        <button
          onClick={() => router.push('/account')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white font-semibold"
        >
          Completar perfil
        </button>
      </div>
    );
  }

  const totales = jugadores.reduce((acc, jugador) => {
    acc[jugador.estado] = (acc[jugador.estado] || 0) + 1;
    return acc;
  }, {});

  const totalMuertos = totales["muerto"] || 0;
  const totalGanadores = totales["ganador"] || 0;
  const totalVivos = totales["vivo"] || 0;
  const totalDescalificados = totales["descalificado"] || 0;
  const totalGuardia = totales["guardia"] || 0;

  const cards = [
    { count: totalVivos, label: "Vivos", emoji: "🟢", bg: "from-green-700 to-green-900", border: "border-green-400", estado: "vivo" },
    { count: totalMuertos, label: "Muertos", emoji: "💀", bg: "from-red-700 to-red-900", border: "border-red-500", estado: "muerto" },
    { count: totalGanadores, label: "Ganadores", emoji: "🏆", bg: "from-yellow-300 to-yellow-500", border: "border-yellow-300 text-black", estado: "ganador" },
    { count: totalDescalificados, label: "Descalificados", emoji: "🚫", bg: "from-gray-700 to-gray-900", border: "border-gray-400", estado: "descalificado" },
    { count: totalGuardia, label: "Guardia", emoji: "🪪", bg: "from-gray-700 to-gray-900", border: "border-gray-400", estado: "guardia" },
  ];

  const reflejoVariants = {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 3,
          ease: "linear",
        }
      }
    }
  };

  const jugadoresFiltrados = filtroActivo
    ? jugadores.filter(j => j.estado === filtroActivo)
    : [];

  return (
    <div style={{ backgroundColor: '#032c3d' }} className="min-h-screen text-white relative">
      {/* Logo */}
      <div className="flex justify-center pt-4">
        <img className="w-150 h-auto" src="https://images.encantia.lat/fg2.png" alt="FetuGames2Logo" />
      </div>

      {/* Totales */}
      <div className="px-4 py-10">
        <h2 className="text-3xl font-extrabold text-center mb-6 animate-pulse">⚔️ Jugadores ⚔️</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-semibold mb-8 relative">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              onClick={() => setFiltroActivo(card.estado)}
              className={select-none bg-gradient-to-br ${card.bg} p-4 rounded-xl shadow-xl border-2 cursor-pointer relative overflow-hidden
                ${card.border} 
                hover:scale-105 hover:rotate-1
              }
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                className="absolute top-0 left-0 w-1/2 h-1 bg-white opacity-30 blur-sm"
                variants={reflejoVariants}
                animate="animate"
              />
              <div className="relative z-10">
                <div className="text-3xl mb-1">{card.emoji}</div>
                <div className="text-lg uppercase tracking-wide">{card.label}</div>
                <div className="text-2xl font-black mt-1">{card.count}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lista de jugadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {jugadores.map((jugador, index) => (
            <a
              key={index}
              href={https://namemc.com/profile/${jugador.players}}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg hover:bg-gray-700 transition"
            >
              <img
                src={https://minotar.net/avatar/${jugador.players}/100}
                alt={jugador.players}
                className="w-20 h-20 rounded-full mb-2"
              />
              <h3 className="font-semibold text-center">
                {jugador.numero != null && (
                  <span className="text-yellow-400 font-bold">#{jugador.numero} </span>
                )}
                <span className="text-white">{jugador.players}</span>
              </h3>
              <span className={text-sm mt-1 px-2 py-1 rounded 
                ${jugador.estado === 'vivo' ? 'bg-green-600' :
                  jugador.estado === 'muerto' ? 'bg-red-600' :
                    jugador.estado === 'ganador' ? 'bg-yellow-500 text-black' :
                      'bg-gray-600'}
              }>
                {jugador.estado}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Modal filtrado */}
      <AnimatePresence>
        {filtroActivo && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-20 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltroActivo(null)}
          >
            <motion.div
              className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 relative shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setFiltroActivo(null)}
                className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-red-500"
                aria-label="Cerrar"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">
                {cards.find(c => c.estado === filtroActivo)?.emoji}{" "}
                {cards.find(c => c.estado === filtroActivo)?.label}
              </h3>

              {jugadoresFiltrados.length === 0 ? (
                <p className="text-center text-gray-400">No hay jugadores en esta categoría.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {jugadoresFiltrados.map((jugador, index) => (
                    <a
                      key={index}
                      href={https://namemc.com/profile/${jugador.players}}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg hover:bg-gray-700 transition"
                    >
                      <img
                        src={https://minotar.net/avatar/${jugador.players}/100}
                        alt={jugador.players}
                        className="w-20 h-20 rounded-full mb-2"
                      />
                      <h3 className="font-semibold text-center">
                        {jugador.numero != null && (
                          <span className="text-yellow-400 font-bold">#{jugador.numero} </span>
                        )}
                        <span className="text-white">{jugador.players}</span>
                      </h3>
                      <span className={text-sm mt-1 px-2 py-1 rounded 
                        ${jugador.estado === 'vivo' ? 'bg-green-600' :
                          jugador.estado === 'muerto' ? 'bg-red-600' :
                            jugador.estado === 'ganador' ? 'bg-yellow-500 text-black' :
                              'bg-gray-600'}
                      }>
                        {jugador.estado}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
