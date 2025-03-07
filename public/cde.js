console.log("cde.js está activo y funcionando correctamente.");

async function verificarEstado() {
    try {
        const response = await fetch("/api/estado"); // Llamada a una API en Next.js que obtiene el estado de Supabase
        const data = await response.json();

        if (data.EOD === "True") {
            bloquearPagina(data.Titulo, data.Motivo, data.hora_de_caida);
        } else {
            restaurarPagina();
        }
    } catch (error) {
        console.error("Error al obtener el estado:", error);
    }
}

// Función para bloquear la página y mostrar el mensaje
function bloquearPagina(titulo, motivo, hora) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            background-color: #222;
            color: white;
            font-family: Arial, sans-serif;
        ">
            <h1 style="font-size: 2rem; color: red;">🔴 Servicio en Mantenimiento 🔴</h1>
            <h2>${titulo}</h2>
            <p><strong>Motivo:</strong> ${motivo}</p>
            <p><strong>Hora de caída:</strong> ${new Date(hora).toLocaleString()}</p>
        </div>
    `;
}

// Función para restaurar la página si EOD es False
function restaurarPagina() {
    console.log("EOD es False, todo funciona normalmente.");
}

// Verifica el estado cada 10 segundos para actualizar cambios en tiempo real
setInterval(verificarEstado, 10000);

// Llamada inicial para verificar el estado al cargar la página
verificarEstado();
