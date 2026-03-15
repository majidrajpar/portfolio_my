#!/usr/bin/env node
/**
 * update-case-study.mjs
 * Usage: node scripts/update-case-study.mjs --slug <slug> [--field value ...]
 *
 * Editable fields: title, subtitle, industry, situation, task, action,
 *                  result, reflection, impact, tech_stack (JSON array string), categories (JSON array string)
 *
 * Example:
 *   node scripts/update-case-study.mjs \
 *     --slug "audit-40-shifting-to-100-population-testing" \
 *     --impact "AED 8M financial impact — 100% coverage — Clean opinion"
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const EDITABLE = ['title','subtitle','industry','situation','task','action','result','reflection','impact','tech_stack','categories'];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] ?? true;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.slug) {
  console.error('ERROR: --slug is required');
  console.error('  node scripts/update-case-study.mjs --slug <slug> --field value ...');
  process.exit(1);
}

const updates = Object.entries(args).filter(([k]) => EDITABLE.includes(k));
if (updates.length === 0) {
  console.error('ERROR: no editable fields provided. Editable:', EDITABLE.join(', '));
  process.exit(1);
}

const db = new Database(join(ROOT, 'portfolio.db'));

// Verify record exists
const existing = db.prepare('SELECT id, title FROM case_studies WHERE slug = ?').get(args.slug);
if (!existing) {
  const all = db.prepare('SELECT slug FROM case_studies').all().map(r => r.slug);
  console.error(`ERROR: No case study with slug="${args.slug}"`);
  console.error('Available slugs:', all.join('\n  '));
  db.close();
  process.exit(1);
}

console.log(`Updating case study: "${existing.title}" (id=${existing.id})`);

const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
const values = updates.map(([, v]) => v);

db.prepare(`UPDATE case_studies SET ${setClauses} WHERE slug = ?`).run(...values, args.slug);
db.close();

updates.forEach(([k, v]) => console.log(`  ${k} → ${v.length > 80 ? v.slice(0, 77) + '...' : v}`));

// Git add + commit + push
const msg = `update portfolio: case study "${existing.title}" (${updates.map(([k]) => k).join(', ')})`;
try {
  execSync(`git -C "${ROOT}" add portfolio.db`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' });
  console.log('\nPushed. GitHub Pages rebuild triggered.');
} catch (e) {
  console.error('Git error:', e.message);
  process.exit(1);
}
