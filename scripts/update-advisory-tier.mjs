#!/usr/bin/env node
/**
 * update-advisory-tier.mjs
 * Usage: node scripts/update-advisory-tier.mjs --tier-id <tier_id> [--field value ...]
 *
 * Tier IDs: ipo-mna | audit-4 | retained-cae
 * Editable fields: name, tagline, description, deliverables (JSON array string), ideal_for, display_order
 *
 * Example:
 *   node scripts/update-advisory-tier.mjs \
 *     --tier-id retained-cae \
 *     --ideal-for "Family Offices, Mid-Market GCC Groups, Scale-Ups"
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// CLI uses kebab-case; DB uses snake_case for ideal_for
const FIELD_MAP = {
  'name': 'name',
  'tagline': 'tagline',
  'description': 'description',
  'deliverables': 'deliverables',
  'ideal-for': 'ideal_for',
  'display-order': 'display_order',
};

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

if (!args['tier-id']) {
  console.error('ERROR: --tier-id is required. Valid IDs: ipo-mna, audit-4, retained-cae');
  process.exit(1);
}

const updates = Object.entries(args)
  .filter(([k]) => FIELD_MAP[k])
  .map(([k, v]) => [FIELD_MAP[k], v]);

if (updates.length === 0) {
  console.error('ERROR: no editable fields. Options: --name --tagline --description --deliverables --ideal-for --display-order');
  process.exit(1);
}

const db = new Database(join(ROOT, 'portfolio.db'));

const existing = db.prepare('SELECT id, name FROM advisory_tiers WHERE tier_id = ?').get(args['tier-id']);
if (!existing) {
  const all = db.prepare('SELECT tier_id FROM advisory_tiers').all().map(r => r.tier_id);
  console.error(`ERROR: No tier with tier_id="${args['tier-id']}"`);
  console.error('Available tier_ids:', all.join(', '));
  db.close();
  process.exit(1);
}

console.log(`Updating advisory tier: "${existing.name}" (id=${existing.id})`);

const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
const values = updates.map(([, v]) => v);

db.prepare(`UPDATE advisory_tiers SET ${setClauses} WHERE tier_id = ?`).run(...values, args['tier-id']);
db.close();

updates.forEach(([k, v]) => console.log(`  ${k} → ${String(v).length > 80 ? String(v).slice(0, 77) + '...' : v}`));

const msg = `update portfolio: advisory tier "${existing.name}" (${updates.map(([k]) => k).join(', ')})`;
try {
  execSync(`git -C "${ROOT}" add portfolio.db`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' });
  console.log('\nPushed. GitHub Pages rebuild triggered.');
} catch (e) {
  console.error('Git error:', e.message);
  process.exit(1);
}
