// Include copyright/license texts for the locked production dependency tree.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const sections = [
  "CarLink frontend third-party notices",
  "Generated from the locked installed production dependency tree. This file is informational; individual license texts below retain their own terms.",
];
for (const [path, metadata] of Object.entries(lock.packages).sort(([a], [b]) =>
  a.localeCompare(b),
)) {
  if (!path || metadata.dev || !path.includes("node_modules/")) continue;
  const name = path.slice(
    path.lastIndexOf("node_modules/") + "node_modules/".length,
  );
  const files = readdirSync(path).filter((file) =>
    /^(licen[sc]e|notice|copyright)(\..*)?$/i.test(file),
  );
  sections.push(
    `${name}@${metadata.version}\nDeclared license: ${metadata.license || "See package metadata"}`,
  );
  for (const file of files)
    sections.push(`${file}\n${readFileSync(join(path, file), "utf8")}`);
}
writeFileSync(
  "dist/THIRD_PARTY_NOTICES.txt",
  sections.join("\n\n--------------------\n\n") + "\n",
);
console.log("Bundled third-party copyright/license notices.");
