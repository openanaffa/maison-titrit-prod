/** Integration settings: runtime-configurable trackers & domain verifications. */

export type AnalyticsConfig = {
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
  pinterestTagId: string;
  tiktokPixelId: string;
  youtubeChannelId: string;
};

export type CustomMeta = { name: string; content: string };

export type VerificationConfig = {
  google: string; // "google-site-verification"
  facebook: string; // "facebook-domain-verification"
  instagram: string; // "instagram-site-verification"
  tiktok: string; // "tiktok-domain-verification"
  custom: CustomMeta[]; // anything else (Pinterest, Bing, Clarity…)
};

export type Integrations = {
  analytics: AnalyticsConfig;
  verification: VerificationConfig;
};
