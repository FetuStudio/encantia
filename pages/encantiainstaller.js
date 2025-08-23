// pages/index.js
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirige automáticamente al enlace de descarga
    window.location.href = "https://drive.usercontent.google.com/download?id=1noJzPSJRC6eip_3dd5I28e4iJX8X7YTd&export=download&authuser=0";
  }, []);

  return (
    <div>
      <h1>Redirigiendo...</h1>
      <p>Si no eres redirigido automáticamente, <a href="https://drive.usercontent.google.com/download?id=1noJzPSJRC6eip_3dd5I28e4iJX8X7YTd&export=download&authuser=0">haz clic aquí</a>.</p>
    </div>
  );
}
