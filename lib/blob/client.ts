import { put, del } from "@vercel/blob";

/**
 * Vercel Blob helpers — require BLOB_READ_WRITE_TOKEN in `.env.local`.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPrivateBlob(
  pathname: string,
  body: Blob | ArrayBuffer | Buffer | string,
) {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set in .env.local");
  }
  return put(pathname, body, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function deleteBlob(url: string) {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set in .env.local");
  }
  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
