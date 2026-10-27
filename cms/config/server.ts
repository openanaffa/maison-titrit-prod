import type { Core } from "@strapi/strapi";

export default ({ env }: Core.Config.Shared.ConfigParams) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL behind Cloudflare + nginx; proxy trusts X-Forwarded-* for secure cookies
  url: env('URL', ''),
  proxy: { koa: env.bool('IS_PROXIED', true) },
  app: {
    keys: env.array('APP_KEYS'),
  },
});
