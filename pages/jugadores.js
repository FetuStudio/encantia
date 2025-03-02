import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient"; // Asegúrate de que la ruta esté correcta

const Jugadores = () => {
  // Estado para almacenar los jugadores
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para saber si está cargando

  useEffect(() => {
    const obtenerJugadores = async () => {
      try {
        // Realiza la consulta a la base de datos de Supabase
        const { data, error } = await supabase
          .from("fg2players") // Asegúrate de que este nombre sea el correcto
          .select("Numero, Nickname"); // Selecciona los campos que necesitas

        if (error) {
          throw new Error(error.message);
        }

        setJugadores(data); // Establece los datos en el estado
      } catch (error) {
        console.error("Error cargando los jugadores:", error.message);
      } finally {
        setLoading(false); // Termina la carga
      }
    };

    obtenerJugadores();
  }, []); // El efecto solo se ejecuta una vez cuando el componente se monta

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex justify-center items-center">
        <h2 className="text-3xl">Cargando jugadores...</h2>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Fetu Games 2</div>
        <img src="/logo.png" alt="Logo" className="h-10" />
      </nav>

      {/* Título */}
      <div className="text-center my-8">
        <h1 className="text-3xl font-bold">Lista de Jugadores</h1>
      </div>

      {/* Cuadros de Jugadores */}
      <div className="grid grid-cols-10 gap-4 p-4 justify-center">
        {jugadores.map((jugador, index) => (
          <div key={index} className="bg-gray-700 p-4 text-center rounded-lg shadow-md">
            <p className="text-lg font-bold">{jugador.Numero}</p>
            <p className="text-sm">{jugador.Nickname}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jugadores;
