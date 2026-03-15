#!/usr/bin/env node
/**
 * add-case-study.mjs
 * Usage: node scripts/add-case-study.mjs \
 *   --title "..." --subtitle "..." --industry "..." \
 *   --situation "..." --task "..." --action "..." \
 *   --result "..." --reflection "..." --impact "..." \
 *   --tech-stack '["Python","Pandas"]' \
 *   --categories '["Fraud Forensics"]'
 *
 * Slug is auto-generated from title.
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED = ['title'];
const OPTIONAL = ['subtitle','industry','situation','task','action','result','reflection','impact'];

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

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const args = parseArgs(process.argv.slice(2));

// Remap kebab-case to snake_case
if (args['tech-stack']) { args.tech_stack = args['tech-stack']; delete args['tech-stack']; }

for (const req of REQUIRED) {
  if (!args[req]) {
    console.error(`ERROR: --${req} is required`);
    process.exit(1);
  }
}

const db = new Database(join(ROOT, 'portfolio.db'));

const slug = slugify(args.title);
const exists = db.prepare('SELECT id FROM case_studies WHERE slug = ?').get(slug);
if (exists) {
  console.error(`ERROR: A case study with slug="${slug}" already exists. Use update-case-study.mjs to edit it.`);
  db.close();
  process.exit(1);
}

const row = {
  title: args.title,
  subtitle: args.subtitle ?? null,
  industry: args.industry ?? null,
  situation: args.situation ?? null,
  task: args.task ?? null,
  action: args.action ?? null,
  result: args.result ?? null,
  reflection: args.reflection ?? null,
  impact: args.impact ?? null,
  tech_stack: args.tech_stack ?? '[]',
  categories: args.categories ?? '[]',
  slug,
};

db.prepare(`
  INSERT INTO case_studies (title,subtitle,industry,situation,task,action,result,reflection,impact,tech_stack,categories,slug)
  VALUES (@title,@subtitle,@industry,@situation,@task,@action,@result,@reflection,@impact,@tech_stack,@categories,@slug)
`).run(row);

const newId = db.prepare('SELECT id FROM case_studies WHERE slug = ?').get(slug).id;
db.close();

console.log(`Added case study: "${args.title}" → slug="${slug}" (id=${newId})`);

const msg = `add portfolio: case study "${args.title}"`;
try {
  execSync(`git -C "${ROOT}" add portfolio.db`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' });
  console.log('\nPushed. GitHub Pages rebuild triggered.');
} catch (e) {
  console.error('Git error:', e.message);
  process.exit(1);
}
