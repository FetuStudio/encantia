import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
useEffect(() => {
  if (typeof window !== "undefined" && "OneSignal" in window) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(function(OneSignal) {
      OneSignal.init({
        appId: "97df49d1-b67d-490b-9157-9eea6ff9a278",
        serviceWorkerPath: "/OneSignalSDK.sw.js", // IMPORTANTE
        serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
        serviceWorkerWorkerPath: "/OneSignalSDKWorker.js"
      });
    });
  }
}, []);


  return <Component {...pageProps} />;
}
