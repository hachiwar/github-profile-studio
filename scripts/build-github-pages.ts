import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const sourceDir = resolve(process.cwd(), "sites", "github-pages");
const outputDir = resolve(process.cwd(), "dist", "github-pages");

rmSync(outputDir, { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  copyFileSync(join(sourceDir, entry.name), join(outputDir, entry.name));
}

writeFileSync(join(outputDir, ".nojekyll"), "");
console.log(`GitHub Pages static site written to ${outputDir}`);
