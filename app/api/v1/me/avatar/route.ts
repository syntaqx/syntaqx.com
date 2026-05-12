import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { errorResponse, json } from "@/lib/api";

/**
 * POST /api/v1/me/avatar
 *
 * Multipart upload of a user avatar. Stores the file in Vercel Blob
 * (public access so <img src> works directly), updates Better Auth's
 * `user.image` to the resulting URL, and deletes the previous blob if
 * it was one we owned.
 *
 * Why we sniff the magic bytes instead of trusting Content-Type: the
 * client controls the multipart Content-Type header. We have to look at
 * the file itself to know what it is.
 */

const MAX_BYTES = 1 * 1024 * 1024; // 1 MB

const SIGNATURES: ReadonlyArray<{
  ext: "png" | "jpg" | "webp" | "gif";
  mime: string;
  test: (b: Uint8Array) => boolean;
}> = [
  {
    ext: "png",
    mime: "image/png",
    test: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "gif",
    mime: "image/gif",
    test: (b) =>
      b.length >= 6 &&
      b[0] === 0x47 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) &&
      b[5] === 0x61,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

function detect(bytes: Uint8Array) {
  return SIGNATURES.find((s) => s.test(bytes));
}

/**
 * Best-effort delete of a previously stored avatar. We only attempt
 * deletion if the URL points at our own Blob store, so a user who
 * already had an external image (OAuth provider, Gravatar) doesn't
 * trigger a 404 against Blob.
 */
async function tryDeletePrevious(url: string | null | undefined) {
  if (!url) return;
  if (!url.includes(".public.blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch {
    // Non-fatal. Stale blob is cheaper than a failed avatar update.
  }
}

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return errorResponse(401, "Authentication required.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return errorResponse(503, "Avatar storage is not configured.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return errorResponse(400, "Expected multipart/form-data.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return errorResponse(400, "Missing 'file' field.");
  }

  if (file.size === 0) {
    return errorResponse(400, "File is empty.");
  }
  if (file.size > MAX_BYTES) {
    return errorResponse(413, "File exceeds the 1 MB limit.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sig = detect(bytes);
  if (!sig) {
    return errorResponse(
      415,
      "Unsupported image format. Use PNG, JPEG, GIF, or WebP.",
    );
  }

  const key = `avatars/${session.user.id}/${Date.now()}.${sig.ext}`;
  const blob = await put(key, new Blob([bytes], { type: sig.mime }), {
    access: "public",
    contentType: sig.mime,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });

  const previous = (session.user as { image?: string | null }).image;

  await auth.api.updateUser({
    headers: reqHeaders,
    body: { image: blob.url },
  });

  await tryDeletePrevious(previous);

  return json({ url: blob.url });
}

export async function DELETE() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return errorResponse(401, "Authentication required.");
  }

  const previous = (session.user as { image?: string | null }).image;

  await auth.api.updateUser({
    headers: reqHeaders,
    body: { image: null },
  });

  await tryDeletePrevious(previous);

  return new Response(null, { status: 204 });
}
