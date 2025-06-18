import { useEffect, useState } from 'react'
import Script from 'next/script'
import '../styles/globals.css'
import supabase from '../utils/supabaseClient'
import AlertBanner from '../components/AlertBanner'

export default function App({ Component, pageProps }) {
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    // OneSignal init
    if (typeof window !== "undefined" && "OneSignal" in window) {
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(function (OneSignal) {
        OneSignal.init({
          appId: "97df49d1-b67d-490b-9157-9eea6ff9a278",
          serviceWorkerPath: "/OneSignalSDK.sw.js",
          serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
          serviceWorkerWorkerPath: "/OneSignalSDKWorker.js"
        })
      })
    }

    // Fetch alerta de Supabase
    async function fetchAlert() {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single()

      if (data && !error) {
        setAlert(data)
      }
    }

    fetchAlert()
  }, [])

  return (
    <>
      {/* Scripts externos */}
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

      {/* Alerta global si existe */}
      {alert && (
        <AlertBanner message={alert.message} type={alert.type || 'info'} />
      )}

      <Component {...pageProps} />
    </>
  )
}
