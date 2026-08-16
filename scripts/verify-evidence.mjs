import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dirsToCheck = [
  join(root, "w5_acceptance_docs", "W5D5"),
  join(root, "w6_acceptance_docs")
];
const failures = [];

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

// 1. Check root files
const w6d5Dir = join(root, "w6_acceptance_docs", "W6D5");
const requiredW6Files = [
  "W6_D5_GATE_REPORT.md",
  "W6_RISK_WAIVER_REGISTER.md",
  "W6_W7_HANDOFF.md",
  "W6_INHERITED_REMEDIATION_FOR_W7.md"
];
for (const file of requiredW6Files) {
  const p = join(w6d5Dir, file);
  if (!existsSync(p)) failures.push(`Missing required root file: ${file}`);
}

const files = dirsToCheck.flatMap(dir => walk(dir));

for (const file of files.filter((path) => extname(path).toLowerCase() === ".md")) {
  if (statSync(file).size === 0) {
    failures.push(`Empty evidence file: ${file}`);
    continue;
  }
  
  const markdown = readFileSync(file, "utf8");



  // Check for SHA placeholders
  if (/<SHA>|TBD|TODO/i.test(markdown)) {
    failures.push(`Placeholder found in sign-off: ${file}`);
  }

  // Check for sign-off SHAs that are not 40 chars
  const shaMatch = markdown.match(/COMMIT_SHA=([A-Za-z0-9_]+)/) || markdown.match(/TESTED_SHA=([A-Za-z0-9_]+)/) || markdown.match(/FROZEN_SHA=([A-Za-z0-9_]+)/);
  if (shaMatch && shaMatch[1] && shaMatch[1].length !== 40) {
    failures.push(`Invalid SHA length (${shaMatch[1].length}) in: ${file}`);
  }

  for (const match of markdown.matchAll(/(?<=\])\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0].trim();
    if (!target || /^(https?:|mailto:)/i.test(target)) continue;
    
    // Disallow absolute local paths in links
    if (/^file:\/\//i.test(target) || /^[a-zA-Z]:[/\\]/.test(target)) {
      failures.push(`Local path in link: ${file} -> ${target}`);
      continue;
    }

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
