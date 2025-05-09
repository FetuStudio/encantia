// pages/500.js
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Error del servidor - Encantia</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-6 text-center transition-colors duration-300">
        <motion.img
          src="https://images.encantia.lat/encantia-logo-2025.webp"
          alt="Encantia Logo"
          className="w-40 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          ¡Vaya! Algo salió mal
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Tuvimos un problema en el servidor. Estamos trabajando para solucionarlo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/">
            <a className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition duration-300">
              Volver al inicio
            </a>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
