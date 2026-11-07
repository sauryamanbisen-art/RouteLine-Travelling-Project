/**
 * RouteLine Asset & Script Resolution Integrity Verification Test
 * Scans all project HTML files to ensure script/link tags resolve reliably
 * across local file://, VS Code Live Server, and GitHub Pages deployments.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const HTML_FILES = ['index.html'];

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        collectHtmlFiles(fullPath);
      }
    } else if (entry.name.endsWith('.html')) {
      const relPath = path.relative(ROOT_DIR, fullPath);
      if (!HTML_FILES.includes(relPath)) {
        HTML_FILES.push(relPath);
      }
    }
  }
}

collectHtmlFiles(path.join(ROOT_DIR, 'pages'));

let totalChecks = 0;
let errors = 0;

console.log(`[Verify] Auditing ${HTML_FILES.length} HTML files for asset integrity...`);

for (const file of HTML_FILES) {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
  
  // 1. Ensure no hardcoded un-prefixed '/vendor/' paths exist in HTML
  totalChecks++;
  if (content.includes('src="/vendor/')) {
    console.error(`[FAIL] ${file} contains broken absolute '/vendor/' path`);
    errors++;
  }

  // 2. If data-lucide icons exist, verify Lucide script tag is included
  totalChecks++;
  if (content.includes('data-lucide=') && !content.includes('lucide.min.js')) {
    console.error(`[FAIL] ${file} contains data-lucide attributes but misses Lucide script loader`);
    errors++;
  }
}

// 3. Verify vendor assets exist in both root and public
totalChecks += 2;
if (!fs.existsSync(path.join(ROOT_DIR, 'vendor/lucide.min.js'))) {
  console.error('[FAIL] vendor/lucide.min.js missing at root');
  errors++;
}
if (!fs.existsSync(path.join(ROOT_DIR, 'public/vendor/lucide.min.js'))) {
  console.error('[FAIL] public/vendor/lucide.min.js missing in public');
  errors++;
}

if (errors === 0) {
  console.log(`[PASS] All ${totalChecks} asset integrity checks passed successfully with 0 errors.`);
  process.exit(0);
} else {
  console.error(`[FAIL] Asset verification failed with ${errors} errors.`);
  process.exit(1);
}
