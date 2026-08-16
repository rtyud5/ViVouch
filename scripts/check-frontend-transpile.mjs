import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require('typescript');
} catch {
  const globalRoot = process.env.NODE_GLOBAL_ROOT || '/opt/nvm/versions/node/v22.16.0/lib/node_modules';
  ts = require(path.join(globalRoot, 'typescript'));
}

const root = path.resolve('frontend/src');
const extensions = new Set(['.js', '.jsx']);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (extensions.has(path.extname(entry.name))) files.push(absolute);
  }
}

walk(root);
const diagnostics = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      checkJs: false,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ES2022,
    },
  });
  for (const diagnostic of result.diagnostics || []) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      diagnostics.push(`${path.relative(process.cwd(), file)}: ${message}`);
    }
  }
}

if (diagnostics.length > 0) {
  console.error(diagnostics.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Frontend transpile passed: ${files.length} JS/JSX files.`);
}
