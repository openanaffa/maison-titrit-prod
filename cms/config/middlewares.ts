import type { Core } from "@strapi/strapi";

export default ({ env }: Core.Config.Shared.ConfigParams) => ([
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]);
