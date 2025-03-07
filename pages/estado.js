import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    const { data, error } = await supabase
        .from("caida")
        .select("EOD, Titulo, Motivo, hora_de_caida")
        .order("hora_de_caida", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
}
