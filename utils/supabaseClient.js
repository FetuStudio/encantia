import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY

export const supabase = createClient(supabaseURL, supabaseAnonKey)

export async function getCdtsStatus() {
    const { data, error } = await supabase
        .from('cdts')
        .select('caida, cdtscode, motivo, hora_caida')
        .eq('id', 1)
        .single(); // Obtener un solo registro

    if (error) {
        console.error("Error fetching CDTS status:", error);
        return { caida: false, cdtscode: null, motivo: '', hora_caida: null };
    }

    return data;
}
