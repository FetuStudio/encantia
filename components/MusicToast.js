// components/MusicToast.js
import { useEffect, useState } from 'react';

export default function MusicToast({ currentMusic, isPlaying }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isPlaying && currentMusic) {
            setVisible(true);

            const timeout = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timeout);
        }
    }, [currentMusic, isPlaying]);

    if (!visible || !currentMusic) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in">
            <div className="font-semibold text-sm">🎵 Reproduciendo ahora:</div>
            <div className="text-base">{currentMusic.titulo}</div>
            <div className="text-xs text-gray-400">{currentMusic.autor}</div>

            <style jsx>{`
                .animate-slide-in {
                    animation: slide-in 0.4s ease-out, fade-out 0.5s ease-in 3.5s forwards;
                }

                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fade-out {
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}
