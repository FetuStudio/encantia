import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setLoading(true);
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // Subir el video a Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, videoFile);

    if (error) {
      console.error('Error uploading video:', error);
      setLoading(false);
      return;
    }

    // Obtener la URL pública del video
    const videoUrl = supabase.storage
      .from('videos')
      .getPublicUrl(filePath).publicURL;

    // Guardar el enlace en la base de datos
    const { user } = await supabase.auth.getUser();

    const { error: dbError } = await supabase
      .from('videos')
      .insert([{ user_id: user.id, video_url: videoUrl }]);

    if (dbError) {
      console.error('Error saving video info:', dbError);
      setLoading(false);
      return;
    }

    // Redirigir al perfil del usuario después de subir el video
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-semibold mb-4">Sube tu Video</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        {loading ? 'Subiendo...' : 'Subir Video'}
      </button>
    </div>
  );
}
