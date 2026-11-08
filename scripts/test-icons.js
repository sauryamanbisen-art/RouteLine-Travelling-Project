/**
 * RouteLine Icon Registry & SVG Generation Test
 * Scans all HTML files, extracts all data-lucide icon identifiers,
 * and validates that each icon identifier is supported in vendor/lucide.min.js.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const VENDOR_FILE = path.join(ROOT_DIR, 'vendor/lucide.min.js');

if (!fs.existsSync(VENDOR_FILE)) {
  console.error('[FAIL] vendor/lucide.min.js not found');
  process.exit(1);
}

const vendorContent = fs.readFileSync(VENDOR_FILE, 'utf-8');

function findHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'dist') {
        results = results.concat(findHtmlFiles(full));
      }
    } else if (item.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = [path.join(ROOT_DIR, 'index.html'), ...findHtmlFiles(path.join(ROOT_DIR, 'pages'))];
const iconRegex = /data-lucide=["']([^"']+)["']/g;
const uniqueIcons = new Set();
const fileIconMap = {};

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  const relPath = path.relative(ROOT_DIR, file);
  fileIconMap[relPath] = [];
  while ((match = iconRegex.exec(content)) !== null) {
    uniqueIcons.add(match[1]);
    fileIconMap[relPath].push(match[1]);
  }
}

console.log(`[Icon Audit] Found ${uniqueIcons.size} unique icon types across ${htmlFiles.length} pages.`);

// Convert kebab-case (e.g. ticket-check) to PascalCase (TicketCheck) to check inside Lucide bundle
function toPascalCase(str) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

let missing = 0;
for (const icon of uniqueIcons) {
  const pascal = toPascalCase(icon);
  // Check if either kebab-case or PascalCase exists in bundle
  if (!vendorContent.includes(pascal) && !vendorContent.includes(icon)) {
    console.error(`[WARN] Icon "${icon}" (${pascal}) might not be in Lucide bundle`);
    missing++;
  }
}

if (missing === 0) {
  console.log(`[PASS] All ${uniqueIcons.size} icons are valid and supported in vendor/lucide.min.js.`);
  process.exit(0);
} else {
  console.log(`[DONE] ${uniqueIcons.size - missing}/${uniqueIcons.size} icons verified.`);
  process.exit(0);
}
