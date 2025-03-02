import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Importamos la instancia de Supabase

const Jugadores = () => {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    const fetchJugadores = async () => {
      const { data, error } = await supabase
        .from("fg2players")
        .select("Numero, Nickname"); // Seleccionamos las columnas

      if (error) {
        console.error("Error al obtener jugadores:", error);
      } else {
        setJugadores(data);
      }
    };

    fetchJugadores();
  }, []);

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
        {jugadores.length > 0 ? (
          jugadores.map((jugador, index) => (
            <div key={index} className="bg-gray-700 p-4 text-center rounded-lg shadow-md">
              <p className="text-lg font-bold">{jugador.Numero}</p>
              <p className="text-sm">{jugador.Nickname}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">Cargando jugadores...</p>
        )}
      </div>
    </div>
  );
};

export default Jugadores;
