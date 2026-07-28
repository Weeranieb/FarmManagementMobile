#!/usr/bin/env node
// Locale invariants for src/locale/{th,en}.json.
//
// These break silently and only in the other language: a missing key renders as
// the raw key path on screen, and a dropped `{{placeholder}}` renders a sentence
// with the number quietly missing. Neither shows up in typecheck, lint, or any
// review of the diff you are actually looking at.
//
// Run: npm run check:locales

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['th', 'en'];
const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g;

/** Flattens to { 'a.b.c': 'value' }. */
function flatten(node, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out[path] = value;
    }
  }
  return out;
}

function placeholdersOf(value) {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
}

const tables = {};
for (const lang of LOCALES) {
  const file = join(root, 'src', 'locale', `${lang}.json`);
  try {
    tables[lang] = flatten(JSON.parse(readFileSync(file, 'utf8')));
  } catch (err) {
    console.error(`✖ ${lang}.json could not be read as JSON: ${err.message}`);
    process.exit(1);
  }
}

const problems = [];
const [base, ...rest] = LOCALES;
const baseKeys = new Set(Object.keys(tables[base]));

for (const lang of rest) {
  const keys = new Set(Object.keys(tables[lang]));
  for (const key of baseKeys) {
    if (!keys.has(key)) problems.push(`missing in ${lang}.json: ${key}`);
  }
  for (const key of keys) {
    if (!baseKeys.has(key)) problems.push(`missing in ${base}.json: ${key}`);
  }
}

for (const lang of LOCALES) {
  for (const [key, value] of Object.entries(tables[lang])) {
    if (typeof value !== 'string') {
      problems.push(`${lang}.json ${key}: expected a string, got ${typeof value}`);
    } else if (value.trim() === '') {
      // An empty string is not a translation — i18next renders it as blank text
      // rather than falling back, so the UI silently loses the label.
      problems.push(`${lang}.json ${key}: empty string`);
    }
  }
}

// Placeholders must match across languages, or one language renders a sentence
// with its number or name missing.
for (const lang of rest) {
  for (const key of baseKeys) {
    if (!(key in tables[lang])) continue;
    const a = placeholdersOf(tables[base][key]);
    const b = placeholdersOf(tables[lang][key]);
    if (a.join(',') !== b.join(',')) {
      problems.push(
        `${key}: placeholders differ — ${base} has [${a.join(', ')}], ${lang} has [${b.join(', ')}]`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`✖ ${problems.length} locale problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`✔ locales OK — ${baseKeys.size} keys, ${LOCALES.join('/')} in parity`);
