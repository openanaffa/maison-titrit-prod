import type { StrapiApp } from '@strapi/strapi/admin';

// Maison Titrit brand — Tifinagh "ⵜⵉⵟⵔⵉⵜ" star mark ("Titrit" = star).
// Mono (ink) renders on the light menu sidebar; gold sits on the auth splash.
import menuLogo from './assets/titrit-menu-logo.svg';
import authLogo from './assets/titrit-auth-logo.svg';

export default {
  config: {
    locales: ['fr', 'ar'],
    appName: 'Maison Titrit CMS',
    menu: {
      logo: menuLogo,
    },
    auth: {
      logo: authLogo,
    },
  },
  bootstrap(app: StrapiApp) {
    // intentionally empty — branding only
  },
};
