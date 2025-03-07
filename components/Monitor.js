// components/Monitor.js
export default function Monitor({ titulo, motivo, horaDeCaida }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>La página está caída</h1>
      <p><strong>Título:</strong> {titulo}</p>
      <p><strong>Motivo:</strong> {motivo}</p>
      <p><strong>Hora de caída:</strong> {new Date(horaDeCaida).toLocaleString()}</p>
    </div>
  );
}
