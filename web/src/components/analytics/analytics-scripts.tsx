"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import Script from "next/script";
import { getConsent, loadConsent, subscribe } from "@/lib/analytics";

/** Re-render any consumer when consent changes. */
export function useConsent() {
  return useSyncExternalStore(subscribe, getConsent, getConsent);
}

/**
 * Analytics scripts — GTM, GA4, and Meta Pixel.
 * Google Consent Mode v2, *advanced*: GTM/GA4 always load and start denied,
 * so Google gets cookieless pings and can model declined visitors; consent
 * updates flip them to granted. Meta Pixel has no consent mode, so it still
 * mounts only after marketing consent. Non-Google tags inside GTM must carry
 * their own consent checks (GTM → tag → Consent settings).
 * IDs are runtime-editable (dashboard → Réglages → Intégrations) with the
 * env/config placeholders as fallback — placeholder IDs
 * (GTM-XXXXXXX, G-XXXXXXXXXX, all-zeros) are ignored so nothing fires until
 * a real ID lands either way.
 *
 * Google Consent Mode v2: the consent DEFAULT (all denied, wait_for_update:
 * 500) is injected beforeInteractive from app/layout.tsx <head> (Next only
 * allows that strategy in the root layout); consent 'update' commands are
 * pushed from lib/analytics.ts on any consent change or restoration.
 */
export function AnalyticsScripts({
  gtmId,
  ga4Id,
  fbPixelId,
}: {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
}) {
  // hydrate consent from localStorage on mount
  React.useEffect(() => {
    loadConsent();
  }, []);

  const consent = useConsent();

  const gtmReady = gtmId && !gtmId.startsWith("GTM-XXXX");
  const gaReady = ga4Id && !ga4Id.startsWith("G-XXXX");
  const fbReady = fbPixelId && !/^0{5,}/.test(fbPixelId);

  return (
    <>
      {gtmReady && (
        <>
          <Script id="gtm-base" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {gaReady && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-init" strategy="lazyOnload">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {consent.marketing && fbReady && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fbPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}
