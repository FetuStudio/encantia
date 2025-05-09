import { useEffect } from 'react';

export default function Adsense() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Error cargando AdSense', e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-8562146544458621"
      data-ad-slot="1061743367" 
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
