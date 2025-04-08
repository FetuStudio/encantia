import MusicToast from './MusicToast';
import { useMusic } from '../context/MusicContext';

export default function MusicToastWrapper() {
    const { currentMusic, isPlaying } = useMusic();
    return <MusicToast currentMusic={currentMusic} isPlaying={isPlaying} />;
}
