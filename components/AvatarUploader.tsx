"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Optional profile-photo picker. Uploads the chosen image straight to the public
 * Supabase Storage `avatars` bucket from the browser (RLS only lets a user write
 * inside avatars/<their-uid>/...), then writes the resulting public URL into a
 * hidden <input> so the surrounding <form> persists it via a server action.
 *
 * Uploading bytes directly to Storage (not through a server action) sidesteps the
 * server-action body-size limit and keeps the image off our server entirely.
 *
 * Reused by the onboarding wizard and the dashboard ProfileCard editor.
 */

const BUCKET = "avatars";
const MAX_BYTES = 3 * 1024 * 1024; // keep in sync with the bucket limit (0007)
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Two initials from a name (or the email local-part), matching ProfileCard. */
function initials(name: string, email: string): string {
  const src = name.trim() || email.replace(/@.*/, "");
  const parts = src.trim().split(/[\s._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function AvatarUploader({
  userId,
  email,
  name,
  initialUrl,
  inputName = "avatar_url",
}: {
  userId: string;
  email: string;
  name: string;
  initialUrl: string | null;
  inputName?: string;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  // A local object-URL preview shown instantly while the upload is in flight.
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Remember the path WE uploaded this session so a re-pick can clean up its
  // predecessor (best effort — failures here are silent and harmless).
  const lastUploadedPath = useRef<string | null>(null);

  const shown = preview ?? url;

  async function removeFromStorage(path: string | null) {
    if (!path) return;
    try {
      await createSupabaseBrowserClient().storage.from(BUCKET).remove([path]);
    } catch {
      /* orphaned object — not worth surfacing to the user */
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked later
    if (!file) return;

    setError(null);
    const ext = MIME_EXT[file.type];
    if (!ext) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 3 MB. Please pick a smaller one.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    const supabase = createSupabaseBrowserClient();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) {
      setUploading(false);
      setPreview(null);
      URL.revokeObjectURL(localPreview);
      setError("Couldn't upload that photo. Please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // Tidy up the previous photo we put there earlier this session.
    void removeFromStorage(lastUploadedPath.current);
    lastUploadedPath.current = path;

    setUrl(publicUrl);
    setUploading(false);
    setPreview(null);
    URL.revokeObjectURL(localPreview);
  }

  function onRemove() {
    setError(null);
    // Only delete an upload WE made this session (and that wasn't saved yet).
    // Never delete the previously-saved object here: the form might be cancelled
    // without persisting, which would leave profiles.avatar_url pointing at a
    // deleted file. Clearing the hidden field is enough; an orphaned saved object
    // is harmless and gets superseded on the next successful save.
    void removeFromStorage(lastUploadedPath.current);
    lastUploadedPath.current = null;
    setUrl(null);
    setPreview(null);
  }

  return (
    <div className="flex items-center gap-5">
      {/* Hidden field the parent <form> submits. Empty string = no photo. */}
      <input type="hidden" name={inputName} value={url ?? ""} readOnly />

      <div className="relative">
        <span
          className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-primary text-2xl font-extrabold text-primary-foreground shadow-lift ring-4 ring-card"
          aria-busy={uploading}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob + remote preview; no optimization needed for a 96px avatar
            <img
              src={shown}
              alt="Your profile photo"
              className="size-full object-cover"
            />
          ) : name.trim() || email ? (
            <span className="font-display">{initials(name, email)}</span>
          ) : (
            <User className="size-9" aria-hidden />
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-primary/60">
              <Loader2 className="size-6 animate-spin text-primary-foreground" />
            </span>
          )}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Camera className="size-4" />
            {shown ? "Change photo" : "Upload photo"}
          </button>
          {shown && !uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Optional. JPG, PNG, or WEBP, up to 3 MB.
        </p>
        {error && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </div>
  );
}
