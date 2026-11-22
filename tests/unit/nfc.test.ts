import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isWebNfcSupported,
  maskFingerprint,
  normalizeAndHashNfcUid,
} from "../../src/lib/nfc";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NFC UID normalization and hashing", () => {
  it("normalizes separators/case and hashes raw UID bytes with SHA-256", async () => {
    const expected = createHash("sha256")
      .update(Buffer.from("04a3221b5c8001", "hex"))
      .digest("hex");

    const fromColonUid = await normalizeAndHashNfcUid("04:a3:22:1b:5c:80:01");
    const fromUpperUid = await normalizeAndHashNfcUid("04A3221B5C8001");
    const fromDashedUid = await normalizeAndHashNfcUid(
      " 04-A3-22-1B-5C-80-01 ",
    );

    expect(fromColonUid).toMatch(/^[0-9a-f]{64}$/);
    expect(fromColonUid).toBe(expected);
    expect(fromUpperUid).toBe(expected);
    expect(fromDashedUid).toBe(expected);

    // Must hash raw binary UID bytes, never the ASCII hex string.
    const asciiDigest = createHash("sha256")
      .update("04a3221b5c8001", "utf8")
      .digest("hex");
    expect(fromColonUid).not.toBe(asciiDigest);
  });

  it("supports 4-byte and 10-byte UIDs", async () => {
    const fourByteExpected = createHash("sha256")
      .update(Buffer.from("deadbeef", "hex"))
      .digest("hex");
    const tenByteExpected = createHash("sha256")
      .update(Buffer.from("0102030405060708090a", "hex"))
      .digest("hex");

    expect(await normalizeAndHashNfcUid("DE:AD:BE:EF")).toBe(fourByteExpected);
    expect(await normalizeAndHashNfcUid("01:02:03:04:05:06:07:08:09:0a")).toBe(
      tenByteExpected,
    );
  });

  it("rejects invalid UID lengths and odd hex strings", async () => {
    for (const invalid of [
      "",
      ":::",
      "04:a3:22", // 3 bytes (too short)
      "04a3221", // odd hex length
      "0102030405060708090a0b", // 11 bytes (too long)
    ]) {
      await expect(normalizeAndHashNfcUid(invalid)).rejects.toThrow();
    }
  });

  it("detects Web NFC availability and masks fingerprints without exposing full hash", () => {
    expect(isWebNfcSupported()).toBe(false);
    vi.stubGlobal("window", {});
    expect(isWebNfcSupported()).toBe(false);
    vi.stubGlobal("window", { NDEFReader: function NDEFReader() {} });
    expect(isWebNfcSupported()).toBe(true);

    const sample = "ab12" + "0".repeat(56) + "ef89";
    expect(maskFingerprint(sample)).toBe("ab12…ef89");
  });
});
