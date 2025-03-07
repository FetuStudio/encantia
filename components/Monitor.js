import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Monitor() {
    useEffect(() => {
        const channel = supabase
            .channel('custom-all-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'caida' }, (payload) => {
                console.log('Nueva caída detectada:', payload.new);
                
                if (payload.new.EOD === "True") {
                    window.location.reload(); // Forzar recarga para activar `cde.js`
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return null; // No renderiza nada
}
