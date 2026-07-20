import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const docsRoot = join(root, "w5_acceptance_docs", "W5D5");
const failures = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(docsRoot);
for (const file of files.filter((path) => extname(path).toLowerCase() === ".md")) {
  const markdown = readFileSync(file, "utf8");
  for (const match of markdown.matchAll(/(?<=\])\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0].trim();
    if (!target || /^(https?:|mailto:)/i.test(target)) continue;
    const linkedPath = resolve(dirname(file), decodeURIComponent(target));
    if (!existsSync(linkedPath)) failures.push(`Broken link: ${file} -> ${target}`);
  }
}

for (const file of files.filter((path) => /\.(png|jpe?g|webp)$/i.test(path))) {
  if (statSync(file).size === 0) failures.push(`Empty media file: ${file}`);
  if (extname(file).toLowerCase() === ".png") {
    const signature = readFileSync(file).subarray(0, 8).toString("hex");
    if (signature !== "89504e470d0a1a0a") failures.push(`Invalid PNG signature: ${file}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Evidence validation passed: ${files.length} files checked.`);
