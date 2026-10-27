import type { StrapiApp } from '@strapi/strapi/admin';
import type { DefaultTheme } from 'styled-components';

// Maison Titrit brand — Tifinagh "ⵜⵉⵟⵉⵜ" star mark ("Titrit" = star).
// Mono (ink) renders on the light menu sidebar; gold sits on the auth splash.
import menuLogo from './assets/titrit-menu-logo.svg';
import authLogo from './assets/titrit-auth-logo.svg';

/**
 * Locked brand palette (web/src/app/globals.css):
 *   cream #F4EAD5 · ink #1C1A17 · bronze #9A6A3A · terracotta #B0532F · henna #6B2D1F
 *
 * Strapi 5 admin: `theme.light` / `theme.dark` are deep-merged (lodash.merge)
 * over the built-in @strapi/design-system tokens, so only the overridden keys
 * need to be provided. Token set verified against the installed
 * @strapi/design-system@2.2.4 `Colors` interface.
 *
 * Derivation rules:
 *   primary  → terracotta ladder towards henna (smallest text sits on 700)
 *   secondary → bronze ladder (hover deepens towards henna/bronze valley)
 *   neutrals → cream-tinted greys on light, cream-on-ink on dark
 *   danger etc. → hue-harmonised but unmistakably red/green/amber
 */
const brandLight = {
  colors: {
    alternative100: '#F3EAE0',
    alternative200: '#E0D2C8',
    alternative500: '#8D7663',
    alternative600: '#776151',
    alternative700: '#614E40',

    buttonNeutral0: '#FFFFFF',
    buttonPrimary500: '#B0532F',
    buttonPrimary600: '#A44426',

    danger100: '#FCE7E3',
    danger200: '#F5C7C1',
    danger500: '#C8472E',
    danger600: '#A63A24',
    danger700: '#8A2F1F',

    neutral0: '#FFFFFF',
    neutral100: '#F4EAD5',
    neutral150: '#EFE6D8',
    neutral200: '#DBD0BE',
    neutral300: '#C2B49E',
    neutral400: '#A5947C',
    neutral500: '#8A7A65',
    neutral600: '#6D5F4E',
    neutral700: '#4A4033',
    neutral800: '#2E2921',
    neutral900: '#1C1A17',
    neutral1000: '#14110F',

    primary100: '#FAEBE4',
    primary200: '#F3D5C8',
    primary500: '#B0532F',
    primary600: '#A44426',
    // darkest — carries small primary text on cream
    primary700: '#8E3A20',

    secondary100: '#F3EAE0',
    secondary200: '#E4D2BC',
    secondary500: '#9A6A3A',
    secondary600: '#82552D',
    secondary700: '#6E4623',

    success100: '#E5F0E4',
    success200: '#C4DFC1',
    success500: '#3F7D42',
    success600: '#2F6433',
    success700: '#265029',

    warning100: '#FBEFD9',
    warning200: '#F3DCAE',
    warning500: '#A57818',
    warning600: '#8A650F',
    warning700: '#6F530C',
  },
} as unknown as DefaultTheme;

const brandDark = {
  colors: {
    alternative100: '#2A211A',
    alternative200: '#3B2F25',
    alternative500: '#A08B75',
    alternative600: '#8D7663',
    alternative700: '#776151',

    buttonNeutral0: '#14110F',
    // hover lightens in dark mode, opposite direction of the light theme
    buttonPrimary500: '#B0532F',
    buttonPrimary600: '#C4653C',

    danger100: '#411815',
    danger200: '#59201C',
    danger500: '#E0674C',
    danger600: '#C8472E',
    danger700: '#A63A24',

    neutral0: '#14110F',
    neutral100: '#1C1A17',
    neutral150: '#221E1B',
    neutral200: '#2E2921',
    neutral300: '#4A4033',
    neutral400: '#6D5F4E',
    neutral500: '#8A7A65',
    neutral600: '#A5947C',
    neutral700: '#C2B49E',
    neutral800: '#E7DCC8',
    neutral900: '#F4EAD5',
    neutral1000: '#F7F1E4',

    primary100: '#3D1D10',
    primary200: '#5C2B18',
    primary500: '#B0532F',
    primary600: '#D0794F',
    // lightest — carries primary text on ink surfaces
    primary700: '#E09365',

    secondary100: '#33261A',
    secondary200: '#4A3524',
    secondary500: '#9A6A3A',
    secondary600: '#B57F48',
    secondary700: '#C79454',

    success100: '#16281A',
    success200: '#1F3B24',
    success500: '#6BAF6E',
    success600: '#8BC98E',
    success700: '#A9DBAC',

    warning100: '#332404',
    warning200: '#4A3508',
    warning500: '#D9A640',
    warning600: '#E5B85D',
    warning700: '#F0C87B',
  },
} as unknown as DefaultTheme;

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
    theme: {
      light: brandLight,
      dark: brandDark,
    },
  },
  bootstrap(app: StrapiApp) {
    // intentionally empty — branding only
  },
};
