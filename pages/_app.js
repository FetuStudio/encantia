import { useEffect } from 'react';
import Script from 'next/script';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "OneSignal" in window) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function(OneSignal) {
        OneSignal.init({
          appId: "97df49d1-b67d-490b-9157-9eea6ff9a278",
          serviceWorkerPath: "/OneSignalSDK.sw.js",
          serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
          serviceWorkerWorkerPath: "/OneSignalSDKWorker.js"
        });
      });
    }
  }, []);

  return (
    <>
      <Script
        src="https://web.cmp.usercentrics.eu/modules/autoblocker.js"
        strategy="afterInteractive"
      />
      <Script
        id="usercentrics-cmp"
        src="https://web.cmp.usercentrics.eu/ui/loader.js"
        data-settings-id="E0yLicy4fkb4pH"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}
