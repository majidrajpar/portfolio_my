#!/usr/bin/env node
/**
 * update-career-milestone.mjs
 * Usage: node scripts/update-career-milestone.mjs --year <year> [--field value ...]
 *
 * Editable fields: company, role, dates, y, align, dx, dy, is_special, is_current
 *
 * List milestones first: node scripts/update-career-milestone.mjs --list
 *
 * Example:
 *   node scripts/update-career-milestone.mjs \
 *     --year 2025 \
 *     --dates "2025–Present" \
 *     --role "Internal Audit Director"
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const EDITABLE = ['company','role','dates','y','curve_y','align','dx','dy','is_special','is_current'];

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
  const rows = db.prepare('SELECT x, company, role, dates FROM career_milestones ORDER BY x ASC').all();
  rows.forEach(r => console.log(`  [year=${r.x}] ${r.company.replace('\n',' ')} — ${r.role} (${r.dates})`));
  db.close();
  process.exit(0);
}

if (!args.year) {
  console.error('ERROR: --year is required (or use --list to see years)');
  process.exit(1);
}

const updates = Object.entries(args).filter(([k]) => EDITABLE.includes(k));
if (updates.length === 0) {
  console.error('ERROR: no editable fields provided. Editable:', EDITABLE.join(', '));
  process.exit(1);
}

const existing = db.prepare('SELECT id, company, role FROM career_milestones WHERE x = ?').get(Number(args.year));
if (!existing) {
  console.error(`ERROR: No milestone at year=${args.year}. Use --list to see years.`);
  db.close();
  process.exit(1);
}

console.log(`Updating milestone: "${existing.role}" at "${existing.company.replace('\n',' ')}" (year=${args.year})`);

// Cast numeric fields
const numericFields = new Set(['y','curve_y','dx','dy','is_special','is_current']);
const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
const values = updates.map(([k, v]) => numericFields.has(k) ? Number(v) : v);

db.prepare(`UPDATE career_milestones SET ${setClauses} WHERE x = ?`).run(...values, Number(args.year));
db.close();

updates.forEach(([k, v]) => console.log(`  ${k} → ${v}`));

const label = `${existing.role} @ ${existing.company.replace('\n',' ')}`;
const msg = `update portfolio: career milestone "${label}" (${updates.map(([k]) => k).join(', ')})`;
try {
  execSync(`git -C "${ROOT}" add portfolio.db`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' });
  console.log('\nPushed. GitHub Pages rebuild triggered.');
} catch (e) {
  console.error('Git error:', e.message);
  process.exit(1);
}
