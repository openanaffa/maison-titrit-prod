import type { Core } from "@strapi/strapi";

export default ({ env }: Core.Config.Shared.ConfigParams) => ([
  'strapi::logger',
  'strapi::errors',
  {
    // Admin media previews load from the R2 public domain
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', env('R2_PUBLIC_URL', '')].filter(Boolean),
          'media-src': ["'self'", 'data:', 'blob:', env('R2_PUBLIC_URL', '')].filter(Boolean),
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]);
