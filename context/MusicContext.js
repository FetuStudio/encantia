import { createContext, useContext, useState, useEffect } from 'react';

const MusicContext = createContext();

export function MusicProvider({ children }) {
    const [currentMusic, setCurrentMusic] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMusic = localStorage.getItem('currentMusic');
            return savedMusic ? JSON.parse(savedMusic) : null;
        }
        return null;
    });
    
    const [isPlaying, setIsPlaying] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isPlaying') === 'true';
        }
        return false;
    });

    useEffect(() => {
        // Guardar el estado de la música en localStorage cuando cambie
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentMusic', JSON.stringify(currentMusic));
            localStorage.setItem('isPlaying', isPlaying);
        }
    }, [currentMusic, isPlaying]);

    return (
        <MusicContext.Provider value={{ currentMusic, setCurrentMusic, isPlaying, setIsPlaying }}>
            {children}
        </MusicContext.Provider>
    );
}

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};
