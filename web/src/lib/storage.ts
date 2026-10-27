/**
 * ============================================================================
 *  MAISON TITRIT — storage provider abstraction
 * ----------------------------------------------------------------------------
 *  Env-driven: if R2_* vars are set, uploads go to Cloudflare R2 (S3 API).
 *  Otherwise, falls back to local disk in /public/uploads (dev only — Vercel's
 *  filesystem is ephemeral, so production MUST set R2 vars).
 *
 *  Both paths return a public URL the storefront can <img src=…>.
 * ============================================================================
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export type UploadResult = { url: string; key: string };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export function assertImage(file: File) {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Format non supporté (jpg, png, webp, avif, gif).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 6 Mo).");
  }
}

/** Detect R2 configuration. */
function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicUrl = process.env.R2_PUBLIC_URL; // e.g. https://cdn.maisontitrit.com
  if (accountId && bucket && accessKeyId && secretAccessKey) {
    return { accountId, bucket, accessKeyId, secretAccessKey, publicUrl };
  }
  return null;
}

/** Save an uploaded image. R2 in production; local disk in dev. */
export async function saveUpload(file: File): Promise<UploadResult> {
  assertImage(file);
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const key = `${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const r2 = r2Config();
  if (r2) {
    return saveToR2(r2, key, buf, file.type, ext);
  }
  return saveToLocal(key, buf, ext);
}

/** Cloudflare R2 (S3-compatible). */
async function saveToR2(
  r2: NonNullable<ReturnType<typeof r2Config>>,
  key: string,
  buf: Buffer,
  contentType: string,
  ext: string,
): Promise<UploadResult> {
  const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com`;
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: `uploads/${key}`,
      Body: buf,
      ContentType: contentType,
    }),
  );
  // Public URL: custom domain (preferred) or R2 public bucket URL
  const base = r2.publicUrl || `https://pub-${r2.bucket}.r2.dev`;
  return { url: `${base}/uploads/${key}`, key: `uploads/${key}` };
}

/** Local disk fallback (dev only — Vercel FS is ephemeral). */
async function saveToLocal(key: string, buf: Buffer, ext: string): Promise<UploadResult> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), buf);
  return { url: `/uploads/${key}`, key };
}
