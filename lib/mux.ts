import "server-only"; // never bundle Mux secrets/signing keys into client code
import Mux from "@mux/mux-node";

/**
 * Mux client (server-only). Used to:
 *  - create assets from a Zoom recording URL (the Inngest job), and
 *  - mint short-lived SIGNED playback tokens so recordings are share-proof.
 *
 * Requires MUX_TOKEN_ID / MUX_TOKEN_SECRET (API) and, for signed playback,
 * MUX_SIGNING_KEY_ID / MUX_SIGNING_KEY_PRIVATE (a base64 private key).
 */
export function muxClient() {
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });
}

/**
 * Create a Mux asset from a (temporary) source video URL, with a SIGNED
 * playback policy. "signed" means the playback id is useless on its own — a
 * viewer also needs a token we mint per request (see signPlaybackToken).
 * Returns the asset id + the signed playback id to store in `recordings`.
 */
export async function createSignedAssetFromUrl(sourceUrl: string) {
  const mux = muxClient();
  const asset = await mux.video.assets.create({
    inputs: [{ url: sourceUrl }],
    playback_policies: ["signed"],
    video_quality: "basic",
  });
  const playbackId = asset.playback_ids?.find((p) => p.policy === "signed")?.id;
  return { assetId: asset.id, playbackId: playbackId ?? null };
}

/**
 * Mint a short-lived signed JWT for a signed playback id. The token expires
 * quickly so even if shared it stops working almost immediately — and we only
 * mint it for users we've re-checked are actively enrolled.
 */
export async function signPlaybackToken(playbackId: string) {
  const mux = muxClient();
  return mux.jwt.signPlaybackId(playbackId, {
    type: "video",
    expiration: "2h",
    keyId: process.env.MUX_SIGNING_KEY_ID,
    keySecret: process.env.MUX_SIGNING_KEY_PRIVATE,
  });
}
