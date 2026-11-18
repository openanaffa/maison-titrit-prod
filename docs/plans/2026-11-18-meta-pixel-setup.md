# Meta Pixel Setup Specification

## Overview
This document outlines the exact environment variables needed to configure Meta Pixel (Facebook Conversions API) for Maison Titrit, along with instructions for adding them in Vercel and the client handoff process.

## Required Environment Variables

| Variable Name | Type | Description | Required |
|---------------|------|-------------|----------|
| `NEXT_PUBLIC_FB_PIXEL_ID` | string | Meta Pixel ID (numeric string) | ✅ Yes |
| `META_CAPI_ACCESS_TOKEN` | string | Meta Conversions API Access Token | ✅ Yes |
| `META_PIXEL_ID` | string | Meta Pixel ID (same as NEXT_PUBLIC_FB_PIXEL_ID) | ✅ Yes |

## Where to Add in Vercel

1. Log in to your Vercel account and navigate to the Maison Titrit project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables with their values:

| Variable Name | Value Type | Example Value |
|---------------|------------|---------------|
| `NEXT_PUBLIC_FB_PIXEL_ID` | String | `123456789012345` |
| `META_CAPI_ACCESS_TOKEN` | String | `abcdef1234567890abcdef1234567890` |
| `META_PIXEL_ID` | String | `123456789012345` |

4. Set the scope to **Production** (and Development if needed)
5. Save the changes

## Client Handoff Instructions

1. **Provide the Pixel ID**: The client (website owner) must provide the numeric Meta Pixel ID
2. **Provide the CAPI Token**: The client must generate and provide the Meta Conversions API Access Token
3. **Do NOT touch client accounts**: We only need the values - no account access or modifications
4. **Client-side implementation**: The Pixel ID will be automatically picked up from `NEXT_PUBLIC_FB_PIXEL_ID` in the site configuration

## Implementation Notes

- The Pixel ID should be a numeric string (e.g., "123456789012345")
- The CAPI token should be a valid access token from Meta Events Manager
- Both values must be set for the Pixel to function properly
- After setting these variables, the client-side Pixel will start firing events after marketing consent is granted
- Server-side Conversions API will begin receiving event data immediately

## Verification Steps

After configuration:
1. Check browser console for `fbq('track', 'PageView')` events
2. Verify no console errors related to Pixel loading
3. Confirm Pixel events appear in Meta Events Manager
4. Test with marketing consent granted and denied states