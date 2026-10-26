#!/usr/bin/env bash
# Dev launcher that ensures the workspace `.env` DATABASE_URL is used,
# even when the shell exports a stale global DATABASE_URL.
cd "$(dirname "$0")/.."
unset DATABASE_URL
export $(grep -v '^#' .env | grep -v '^\s*$' | grep -v '^\s*export' | xargs)
exec bun run dev
