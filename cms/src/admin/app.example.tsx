import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      // 'ar', 'fr', 'vs'
      'fr',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
