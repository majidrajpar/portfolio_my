#!/usr/bin/env node

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const dbPath = join(ROOT, 'portfolio.db');
const db = new Database(dbPath, { readonly: true });

const tables = ['career_milestones', 'case_studies', 'professional_engagements', 'advisory_tiers', 'category_meta'];

console.log(`Checking database at: ${dbPath}`);

tables.forEach((table) => {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
  console.log(`  ${table}: ${count}`);
});

db.close();
