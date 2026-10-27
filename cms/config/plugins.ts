import type { Core } from "@strapi/strapi";

/**
 * Media goes to Cloudflare R2 (S3-compatible) so uploads survive container
 * rebuilds. Without R2 env vars (local dev) Strapi keeps the local provider.
 */
export default ({ env }: Core.Config.Shared.ConfigParams) =>
  env('R2_BUCKET')
    ? {
        upload: {
          config: {
            provider: 'aws-s3',
            providerOptions: {
              baseUrl: env('R2_PUBLIC_URL'), // e.g. https://cdn.maisontitrit.com
              rootPath: 'cms',
              s3Options: {
                endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
                region: 'auto',
                forcePathStyle: true,
                credentials: {
                  accessKeyId: env('R2_ACCESS_KEY_ID'),
                  secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
                },
                params: { Bucket: env('R2_BUCKET') },
              },
            },
          },
        },
      }
    : {};
