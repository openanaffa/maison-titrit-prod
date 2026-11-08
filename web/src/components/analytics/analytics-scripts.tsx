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
 * Guard against duplicate initialization across route changes: next/script
 * can remount on client-side navigations, so each tracker initializes once.
 */
function shouldInit(id: string): boolean {
  if (typeof window === "undefined") return true;
  const w = window as unknown as { __titritScripts?: Record<string, boolean> };
  w.__titritScripts = w.__titritScripts || {};
  if (w.__titritScripts[id]) return false;
  w.__titritScripts[id] = true;
  return true;
}

/**
 * Analytics scripts — GTM, GA4, Meta Pixel, Pinterest Tag, TikTok Pixel, YouTube.
 * Google Consent Mode v2, *advanced*: GTM/GA4 always load and start denied,
 * so Google gets cookieless pings and can model declined visitors; consent
 * updates flip them to granted. Meta Pixel has no consent mode, so it still
 * mounts only after marketing consent. Non-Google tags inside GTM must carry
 * their own consent checks (GTM → tag → Consent settings).
 * IDs are runtime-editable (dashboard → Réglages → Intégrations) with the
 * env/config placeholders as fallback — placeholder IDs
 * (GTM-XXXXXXX, G-XXXXXXXXXX, all-zeros, empty) are ignored so nothing fires
 * until a real ID lands either way.
 *
 * Google Consent Mode v2: the consent DEFAULT (all denied, wait_for_update:
 * 500) is injected beforeInteractive in app/layout.tsx <head> (Next only
 * allows that strategy in the root layout); consent 'update' commands are
 * pushed from lib/analytics.ts on any consent change or restoration.
 */
export function AnalyticsScripts({
  gtmId,
  ga4Id,
  fbPixelId,
  pinterestTagId,
  tiktokPixelId,
  youtubeChannelId,
}: {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
  pinterestTagId: string;
  tiktokPixelId: string;
  youtubeChannelId: string;
}) {
  // hydrate consent from localStorage on mount
  React.useEffect(() => {
    loadConsent();
  }, []);

  const consent = useConsent();

  const gtmReady = Boolean(gtmId) && !gtmId.startsWith("GTM-XXXX");
  const gaReady = Boolean(ga4Id) && !ga4Id.startsWith("G-");
  const fbReady = Boolean(fbPixelId) && !/^0{5,}/.test(fbPixelId);
  const pinterestReady = Boolean(pinterestTagId);
  const tiktokReady = Boolean(tiktokPixelId);
  const youtubeReady = Boolean(youtubeChannelId);

  return (
    <>
      {gtmReady && shouldInit("gtm-base") && (
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

      {gaReady && shouldInit("ga4") && (
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

      {consent.marketing && fbReady && shouldInit("fb-pixel") && (
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

      {consent.marketing && pinterestReady && shouldInit("pinterest-tag") && (
        <Script
          id="pinterest-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: [
              `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");`,
              `pintrk('load', '${pinterestTagId}');`,
              `pintrk('page');`,
            ].join("\n"),
          }}
        />
      )}

      {consent.marketing && tiktokReady && shouldInit("tiktok-pixel") && (
        <>
          <Script
            id="tiktok-pixel-src"
            strategy="afterInteractive"
            src="https://analytics.tiktok.com/i18n/pixel/events.js"
          />
          <Script
            id="tiktok-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function ttq() { window.dataLayer.push(arguments); }
ttq('init', '${tiktokPixelId}');
ttq('track', 'PageView');`,
            }}
          />
        </>
      )}

      {youtubeReady && shouldInit("youtube-tracker") && (
        <Script
          id="youtube-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
// YouTube video engagement events emitted consent-gated via
// lib/analytics.trackYouTubeEngagement() land here on the shared dataLayer
// (GA4 / GTM YouTube measurement).`,
          }}
        />
      )}
    </>
  );
}
