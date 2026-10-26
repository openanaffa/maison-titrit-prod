# =============================================================================
#  Maison Titrit — Strapi CMS production image (target: Oracle Cloud VPS)
#  Multi-stage: full install + build → pruned production runtime.
#  NOTE: container builds use Node/npm internally so the image matches Strapi's
#  officially supported runtime; the repo itself stays Bun-first (host tooling).
# =============================================================================

# --- Stage 1: build ----------------------------------------------------------
FROM node:22-alpine AS build

# libvips for sharp (image processing used by Strapi upload plugin)
RUN apk add --no-cache vips-dev

WORKDIR /opt/app
ENV NODE_ENV=production

COPY cms/package.json cms/package-lock.json* ./
RUN npm ci || npm install

COPY cms .

# Strapi expects the environment at build time (it bakes some config in)
ARG DATABASE_CLIENT=postgres
RUN npm run build

# Prune dev dependencies for a slim runtime layer
RUN npm prune --omit=dev

# --- Stage 2: runtime --------------------------------------------------------
FROM node:22-alpine AS runtime

# libvips runtime libs (Alpine package name: vips)
RUN apk add --no-cache vips

WORKDIR /opt/app
ENV NODE_ENV=production

COPY --from=build /opt/app ./

EXPOSE 1337

USER node

CMD ["npm", "run", "start"]
