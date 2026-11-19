---
title: "Sentry onboarding progress API: send stages in order"
author: Mohamed
date: 2026-11-19
branch: fix/sentry-router-transition
id: l-58a4121e
scope: repo
status: active
src: agent
---

## Watch out
Sentry onboarding agent-progress stages are order-sensitive: sending a stage straight to 'completed' without an earlier 'active'/'waiting' call marks it terminally 'bypassed' (unfixable for the run). Send active -> completed in sequence.
