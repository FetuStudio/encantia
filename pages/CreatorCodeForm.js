import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorCodeForm() {
    const [formData, setFormData] = useState({
        nombresapellidos: "",
        dnionif: "",
        fechadenacimiento: "",
        comoquiereselcode: "",
        celect: "",
        ndt: "", // Número de teléfono
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAgeConfirmation = (e) => {
        setIsAgeConfirmed(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const { nombresapellidos, dnionif, fechadenacimiento, comoquiereselcode, celect, ndt } = formData;

        // Validación de campos obligatorios
        if (!nombresapellidos || !fechadenacimiento || !comoquiereselcode || !celect || !ndt) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }

        // Validación de edad
        if (!isAgeConfirmed) {
            setError("Debes confirmar que tienes más de 14 años.");
            return;
        }

        const birthDate = new Date(fechadenacimiento);
        if (isNaN(birthDate.getTime())) {
            setError("La fecha de nacimiento no es válida.");
            return;
        }

        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        const isOlderThan14 =
            age > 14 || (age === 14 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

        if (!isOlderThan14) {
            setError("Debes tener al menos 14 años para solicitar un código de creador.");
            return;
        }

        // Enviar datos a Supabase
        setLoading(true);
        const { error } = await supabase.from("creatorcode").insert([
            {
                nombresapellidos,
                dnionif,
                fechadenacimiento,
                comoquiereselcode,
                celect,
                ndt, // Guardar número de teléfono
            },
        ]);

        if (error) {
            setError("❌ Hubo un error al enviar. Intenta de nuevo.");
        } else {
            setSuccess(true);
            setFormData({
                nombresapellidos: "",
                dnionif: "",
                fechadenacimiento: "",
                comoquiereselcode: "",
                celect: "",
                ndt: "",
            });
        }

        setLoading(false);
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="flex gap-4">
                    <div className="w-5 h-5 bg-green-400 rounded-full animate-ping"></div>
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-ping [animation-delay:.2s]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-gray-900 text-white p-8 rounded-2xl shadow-2xl"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
                    ¡Solicita tu Código de Creador!
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField
                        label="Nombre y Apellidos"
                        name="nombresapellidos"
                        value={formData.nombresapellidos}
                        onChange={handleChange}
                    />
                    <InputField
                        label="DNI o NIF (Opcional)"
                        name="dnionif"
                        value={formData.dnionif}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Fecha de Nacimiento"
                        name="fechadenacimiento"
                        type="date"
                        value={formData.fechadenacimiento}
                        onChange={handleChange}
                    />
                    <InputField
                        label="¿Cómo quieres que sea tu código?"
                        name="comoquiereselcode"
                        value={formData.comoquiereselcode}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Correo Electrónico"
                        name="celect"
                        type="email"
                        value={formData.celect}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Número de Teléfono"
                        name="ndt"
                        type="tel"
                        value={formData.ndt}
                        onChange={handleChange}
                    />

                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="ageConfirmation"
                            checked={isAgeConfirmed}
                            onChange={handleAgeConfirmation}
                            className="mt-1"
                        />
                        <label htmlFor="ageConfirmation" className="text-sm text-gray-300">
                            Confirmo tener más de 14 años. (Se requiere una cuenta de Tebex con método de pago verificado para obtener un código de creador.)
                        </label>
                    </div>

                    <p className="text-sm text-gray-300 mt-2">
                        Si no conoce los requisitos para obtener el código de creador dale aquí{" "}
                        <a
                            href="https://cco.encantia.lat/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 underline"
                        >
                            Aquí
                        </a>.
                    </p>

                    <button
                        type="submit"
                        disabled={loading || !isAgeConfirmed}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
                    >
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>

                    <AnimatePresence>
                        {success && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-green-400 text-center font-medium"
                            >
                                ✅ ¡Tu solicitud ha sido enviada!
                            </motion.p>
                        )}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-red-400 text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </form>
            </motion.div>
        </div>
    );
}

function InputField({ label, name, value, onChange, type = "text" }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-semibold text-gray-300">
                {label}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500"
                placeholder={label}
            />
        </div>
    );
}
