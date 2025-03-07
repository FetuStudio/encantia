// pages/maintenance.js

import React from 'react';

const MaintenancePage = ({ reason, startTime }) => {
  const currentTime = new Date().toLocaleString();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>¡Ups! Estamos en Mantenimiento</h1>
      <p style={styles.message}>
        Lo sentimos, estamos realizando tareas de mantenimiento. Por favor, vuelve más tarde.
      </p>
      <p><strong>Motivo:</strong> {reason}</p>
      <p><strong>Hora de caída:</strong> {startTime ? new Date(startTime).toLocaleString() : currentTime}</p>
      <p><strong>Hora actual:</strong> {currentTime}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
  message: {
    fontSize: '1.2rem',
    color: '#555',
  },
};

export default MaintenancePage;
