export function isWebNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export function maskFingerprint(fingerprint: string): string {
  const clean = fingerprint.trim().toLowerCase();
  if (clean.length < 12) return "••••";
  return `${clean.slice(0, 4)}…${clean.slice(-4)}`;
}

/**
 * Strips non-hex separators from an NFC serial/UID, validates 4–10 byte
 * length (8–20 even hex characters), converts to raw UID bytes, and returns
 * the 64-character lowercase SHA-256 digest without retaining the raw UID.
 */
export async function normalizeAndHashNfcUid(rawUid: string): Promise<string> {
  if (typeof rawUid !== "string") {
    throw new Error("Invalid NFC UID.");
  }
  const hex = rawUid.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  if (hex.length < 8 || hex.length > 20 || hex.length % 2 !== 0) {
    throw new Error(
      "NFC UID must contain an even number of 8 to 20 hexadecimal characters.",
    );
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable in this context.");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
