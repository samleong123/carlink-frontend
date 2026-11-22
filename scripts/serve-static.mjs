// Local verification only. Production uses the static host, not this Node process.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { headers } from "../deploy/headers.mjs";
const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = decodeURIComponent(url.pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep))
      throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const content = await readFile(file);
    res.writeHead(200, {
      ...headers,
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    res.end(content);
  } catch {
    res.writeHead(404, {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found");
  }
}).listen(4173, "127.0.0.1", () =>
  console.log("Built CarLink verification server: http://127.0.0.1:4173"),
);
