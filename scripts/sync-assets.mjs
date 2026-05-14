#!/usr/bin/env node
import { cp } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const assetsDir = resolve(rootDir, "skills/mdxit/assets/runtime");

const copies = [
  { from: "src", to: "src" },
  { from: "examples", to: "examples" },
  { from: "index.html", to: "index.html" },
  { from: "package.json", to: "package.json" },
  { from: "tsconfig.json", to: "tsconfig.json" },
  { from: "tsconfig.cli.json", to: "tsconfig.cli.json" },
  { from: "vite.config.ts", to: "vite.config.ts" }
];

for (const { from, to } of copies) {
  const src = resolve(rootDir, from);
  const dest = resolve(assetsDir, to);

  if (!existsSync(src)) {
    console.warn(`WARN: ${from} not found, skipping`);
    continue;
  }

  await cp(src, dest, {
    recursive: true,
    force: true,
    filter: (source) =>
      !source.includes("node_modules") &&
      !source.includes("/dist/") &&
      !source.includes(".DS_Store")
  });

  console.log(`  ${from} → skills/mdxit/assets/runtime/${to}`);
}

console.log("\nSync done. Skill package is ready for install.");
