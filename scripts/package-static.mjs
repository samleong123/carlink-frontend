import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
execFileSync(
  process.execPath,
  ["../scripts/prepare-frontend-static.mjs", "dist", "--check"],
  { stdio: "inherit" },
);
execFileSync(process.execPath, ["scripts/coverage.mjs", "--check"], {
  stdio: "inherit",
});
execFileSync(process.execPath, ["scripts/host-config.mjs", "--check"], {
  stdio: "inherit",
});
const files = [];
function walk(directory, prefix = "") {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) walk(join(directory, entry.name), relative + "/");
    else if (entry.isFile()) {
      if (
        !/^(index\.html|favicon\.svg|og-cover\.png|link-entry\.js|THIRD_PARTY_NOTICES\.txt|(?:auth|invitations)\/confirm\/index\.html|assets\/[A-Za-z0-9_-]+\.(?:js|css|svg|woff2?))$/.test(
          relative,
        )
      )
        throw new Error(`Unreviewed static file: ${relative}`);
      const content = readFileSync(join(directory, entry.name));
      files.push({
        path: relative,
        bytes: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    } else throw new Error(`Unsupported static entry: ${relative}`);
  }
}
walk("dist");
files.sort((a, b) => a.path.localeCompare(b.path));
if (!files.some((file) => file.path === "THIRD_PARTY_NOTICES.txt"))
  throw new Error("Build license notices first");
const digest = createHash("sha256").update(JSON.stringify(files)).digest("hex");
const name = `carlink-static-${new Date().toISOString().slice(0, 10)}-${digest.slice(0, 12)}`;
mkdirSync("releases", { recursive: true });
const archive = resolve("releases", name + ".zip");
if (existsSync(archive))
  throw new Error(
    `Archive already exists; preserved without overwriting: ${archive}`,
  );
execFileSync("zip", ["-X", "-q", archive, ...files.map((file) => file.path)], {
  cwd: resolve("dist"),
});
const sha256 = createHash("sha256").update(readFileSync(archive)).digest("hex");
writeFileSync(
  `releases/${name}.manifest.json`,
  JSON.stringify(
    {
      frontend_origin: "https://carlink.samsam123.name.my",
      api_origin: "https://carlink-be.samsam123.name.my",
      archive: name + ".zip",
      archive_sha256: sha256,
      contract_sha256: JSON.parse(
        readFileSync("docs/operation-coverage.json", "utf8"),
      ).contract_sha256,
      files,
      status:
        "Static artifact only; deployment and authenticated/provider/hardware acceptance pending. See docs/RELEASE_READINESS.md.",
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(`releases/${name}.zip.sha256`, `${sha256}  ${name}.zip\n`);
console.log(
  `Uploadable static archive: ${archive}\nSHA-256: ${sha256}\nOnly dist contents are packaged; host configuration is separate.`,
);
