import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'next/router';

const Libro = () => {
    const router = useRouter();
    const { id } = router.query; // Obtenemos el id desde la URL
    const [libro, setLibro] = useState(null);  // Almacenaremos el libro aquí
    const [error, setError] = useState(null);  // Para manejar posibles errores
    const [loading, setLoading] = useState(true); // Para mostrar el estado de carga

    useEffect(() => {
        const fetchLibro = async () => {
            if (!id) return; // Aseguramos que el id esté disponible

            setLoading(true); // Establecemos loading en true antes de hacer la consulta

            // Realizamos la consulta a la base de datos para obtener el libro
            const { data, error } = await supabase
                .from('libros') // Nombre de la tabla
                .select('*')
                .eq('id', id); // Filtramos por id

            if (error) {
                setError('Error al obtener el libro: ' + error.message);
                setLoading(false);
                return;
            }

            if (data.length === 0) {
                setError('No se encontró el libro con el id: ' + id);
                setLoading(false);
                return;
            }

            // Si hay más de un libro con el mismo id (esto no debería pasar si la columna id es única)
            if (data.length > 1) {
                setError('Se encontraron varios libros con el mismo id. Esto debería corregirse en la base de datos.');
                setLoading(false);
                return;
            }

            setLibro(data[0]);  // Solo hay un libro, así que tomamos el primer elemento del array
            setLoading(false);  // Terminamos el estado de carga
        };

        fetchLibro();  // Llamamos a la función de fetch
    }, [id]); // Solo vuelve a ejecutar cuando el id cambia

    // Si está cargando, mostramos un mensaje de carga
    if (loading) {
        return <div>Cargando...</div>;
    }

    // Si ocurre un error, lo mostramos en la pantalla
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{libro.title}</h1>
            <img
                src={libro.cover_image} // Asegúrate de que la portada esté bien almacenada en la base de datos
                alt={libro.title}
                className="w-64 h-auto mb-4"
            />
            <p className="mb-4">{libro.description}</p>

            <h2 className="text-xl font-semibold mb-4">Capítulos</h2>
            <div className="space-y-4">
                {libro.chapters ? libro.chapters.map((capitulo, index) => (
                    <div key={index}>
                        <h3 className="text-lg font-semibold">Capítulo {capitulo.number}</h3>
                        <p>{capitulo.content}</p>
                    </div>
                )) : (
                    <p>No hay capítulos disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Libro;
