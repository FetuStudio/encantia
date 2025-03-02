import React from "react";

const Jugadores = () => {
  const jugadores = Array.from({ length: 90 }, (_, i) => `Jugador ${i + 1}`);

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
            {jugador}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jugadores;
