import fileOrigins from "./file-origins.json" with { type: "json" };

export const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self'",
  "style-src-elem 'self'",
  "style-src-attr 'unsafe-inline'",
  "connect-src 'self' https://carlink-be.samsam123.name.my",
  `img-src 'self' data: ${fileOrigins.join(" ")} https://tile.openstreetmap.org https://*.tile.openstreetmap.org`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");
export const headers = {
  "Content-Security-Policy": csp,
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), bluetooth=()",
  "Cache-Control": "no-store",
};
