export const MILEAGE_METRE_FIELDS = new Set<string>([
  "distance_m",
  "accepted_distance_m",
  "distance_since_baseline_m",
  "estimated_odometer_m",
  "packet_snapshot_distance_m",
  "reading_m",
  "carry_in_distance_m",
  "usage_since_service_m",
]);

export function isMileageMetreField(field: string): boolean {
  const leaf = field.split(".").at(-1) ?? field;
  return MILEAGE_METRE_FIELDS.has(leaf);
}

export function kmToMetres(value: unknown): number | undefined {
  if (value === null || value === undefined || typeof value === "boolean") {
    return undefined;
  }
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 1000);
}

export function convertMileageInputsToMetres<T extends Record<string, unknown>>(
  body: T,
  fields: string[],
): T {
  const next: Record<string, unknown> = { ...body };
  for (const field of fields) {
    const metres = kmToMetres(next[field]);
    if (metres !== undefined) {
      next[field] = metres;
    }
  }
  return next as T;
}

export function formatMetresFromKm(value: unknown): string | null {
  const metres = kmToMetres(value);
  if (metres === undefined) return null;
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(metres)} m`;
}

export function formatKmFromMetres(value: unknown): {
  km: number;
  metres: number;
  kmText: string;
  metresText: string;
} | null {
  if (value === null || value === undefined || typeof value === "boolean") {
    return null;
  }
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return null;
  const metres = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(metres)) return null;
  const km = metres / 1000;
  const maxFrac = km !== 0 && Math.abs(km) < 0.001 ? 6 : 3;
  const kmText = `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  }).format(km)} km`;
  const metresText = `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(metres)} m`;
  return { km, metres, kmText, metresText };
}
