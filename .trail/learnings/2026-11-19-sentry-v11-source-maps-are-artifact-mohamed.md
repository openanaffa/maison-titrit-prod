---
title: "Sentry v11 source maps are artifact bundles, not release files"
author: Mohamed
date: 2026-11-19
branch: fix/sentry-router-transition
id: l-bfed4607
scope: repo
status: active
src: agent
---

## Decided
@sentry/nextjs v11 stores uploaded source maps as artifact bundles keyed by debug IDs, NOT as release files. Verifying 'release files = 0' in the API is a red herring; the real check is that served JS bundles contain _sentryDebugIds (fetch any /_next/static chunk and grep).
