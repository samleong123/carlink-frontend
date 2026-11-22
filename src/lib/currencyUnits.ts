export function isCurrencyMinorField(field: string): boolean {
  const leaf = field.split(".").at(-1) ?? field;
  return leaf.endsWith("_minor");
}

export function majorToMinor(value: unknown): number | undefined {
  if (value === null || value === undefined || typeof value === "boolean") {
    return undefined;
  }
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100);
}

export function minorToMajor(value: unknown): number | undefined {
  if (value === null || value === undefined || typeof value === "boolean") {
    return undefined;
  }
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Number((n / 100).toFixed(2));
}

export function convertCurrencyInputsToMinor<T extends Record<string, unknown>>(
  body: T,
  fields: string[],
): T {
  const next: Record<string, unknown> = { ...body };
  for (const field of fields) {
    const minor = majorToMinor(next[field]);
    if (minor !== undefined) {
      next[field] = minor;
    }
  }
  return next as T;
}

export function formatMinorPreviewFromMajor(value: unknown): string | null {
  const minor = majorToMinor(value);
  if (minor === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(minor);
}

export function formatMajorFromMinor(
  value: unknown,
  currency = "MYR",
): { majorText: string; minorText: string } | null {
  if (value === null || value === undefined || typeof value === "boolean") {
    return null;
  }
  const raw =
    typeof value === "number"
      ? Number.isFinite(value)
        ? String(Math.round(value))
        : ""
      : typeof value === "string"
        ? value.trim()
        : "";
  if (!raw || !/^-?\d+$/.test(raw)) return null;
  const negative = raw.startsWith("-");
  const cents = BigInt(negative ? raw.slice(1) : raw);
  const majorText = `${negative ? "-" : ""}${currency} ${(cents / 100n).toLocaleString("en-MY")}.${String(cents % 100n).padStart(2, "0")}`;
  const minorNum = Number(raw);
  const minorFormatted = Number.isSafeInteger(minorNum)
    ? new Intl.NumberFormat("en-US").format(minorNum)
    : raw;
  return { majorText, minorText: `${minorFormatted} minor` };
}
