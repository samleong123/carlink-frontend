// Optional deployment examples. Never applies or changes a running host.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { headers } from "../deploy/headers.mjs";
const quoted = (value) => JSON.stringify(value);
const outputs = {
  "deploy/apache.htaccess":
    "# Review AllowOverride/module support before installing as .htaccess in the frontend document root.\n# Do not replace an existing site configuration without merging it.\nDirectoryIndex index.html\nOptions -Indexes\n<IfModule mod_negotiation.c>\n  Options -MultiViews\n</IfModule>\n<IfModule mod_headers.c>\n" +
    Object.entries(headers)
      .map(([key, value]) => `  Header always set ${key} ${quoted(value)}`)
      .join("\n") +
    "\n</IfModule>\n# Directory indexes serve the two packaged confirmation shells. Missing assets stay 404.\n",
  "deploy/nginx.conf.example":
    "# Merge into the HTTPS server for carlink.samsam123.name.my.\n# Set root to the deployed dist contents, not the Laravel public directory.\n# Do not use a blanket SPA fallback: missing assets must stay 404.\nindex index.html;\nautoindex off;\n" +
    Object.entries(headers)
      .map(([key, value]) => `add_header ${key} ${quoted(value)} always;`)
      .join("\n") +
    "\nlocation / {\n  try_files $uri $uri/ =404;\n}\n",
};
for (const [path, contents] of Object.entries(outputs)) {
  if (process.argv.includes("--check")) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== contents)
      throw new Error(`Stale host example: ${path}`);
  } else writeFileSync(path, contents);
}
console.log(
  "Static-host examples match deploy/headers.mjs; no deployment performed.",
);
