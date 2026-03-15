#!/usr/bin/env node
/**
 * update-engagement.mjs
 * Usage: node scripts/update-engagement.mjs --id <id> [--field value ...]
 *
 * Editable fields: title, category, desc, outcome, display_order, categories (JSON array string)
 *
 * List engagements first: node scripts/update-engagement.mjs --list
 *
 * Example:
 *   node scripts/update-engagement.mjs \
 *     --id 1 \
 *     --outcome "Recovered SAR 4.1M annually via automated risk engine."
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const EDITABLE = ['title','category','desc','outcome','display_order','categories'];

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
const db = new Database(join(ROOT, 'portfolio.db'));

if (args.list) {
  const rows = db.prepare('SELECT id, title, category FROM professional_engagements ORDER BY display_order').all();
  rows.forEach(r => console.log(`  [${r.id}] ${r.title} (${r.category})`));
  db.close();
  process.exit(0);
}

if (!args.id) {
  console.error('ERROR: --id is required (or use --list to see IDs)');
  process.exit(1);
}

const updates = Object.entries(args).filter(([k]) => EDITABLE.includes(k));
if (updates.length === 0) {
  console.error('ERROR: no editable fields provided. Editable:', EDITABLE.join(', '));
  process.exit(1);
}

const existing = db.prepare('SELECT id, title FROM professional_engagements WHERE id = ?').get(Number(args.id));
if (!existing) {
  console.error(`ERROR: No engagement with id=${args.id}. Use --list to see IDs.`);
  db.close();
  process.exit(1);
}

console.log(`Updating engagement: "${existing.title}" (id=${existing.id})`);

const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
const values = updates.map(([, v]) => v);

db.prepare(`UPDATE professional_engagements SET ${setClauses} WHERE id = ?`).run(...values, existing.id);
db.close();

updates.forEach(([k, v]) => console.log(`  ${k} → ${v.length > 80 ? v.slice(0, 77) + '...' : v}`));

const msg = `update portfolio: engagement "${existing.title}" (${updates.map(([k]) => k).join(', ')})`;
try {
  execSync(`git -C "${ROOT}" add portfolio.db`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' });
  console.log('\nPushed. GitHub Pages rebuild triggered.');
} catch (e) {
  console.error('Git error:', e.message);
  process.exit(1);
}
