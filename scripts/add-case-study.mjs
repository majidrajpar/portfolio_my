#!/usr/bin/env node
/**
 * add-case-study.mjs
 * Appends one case to the seed literals in scripts/init-db.mjs.
 * npm run build deletes and reseeds portfolio.db, so this script does not write that file.
 *
 * Usage: node scripts/add-case-study.mjs \
 *   --title "..." --industry "..." \
 *   [--subtitle "..."] [--situation "..."] [--task "..."] [--action "..."] \
 *   [--result "..."] [--reflection "..."] [--impact "..."] \
 *   [--tech-stack '["Python","Pandas"]'] \
 *   [--categories '["Fraud Forensics"]'] \
 *   [--display-order 11] [--tier secondary] \
 *   [--related-tool id] [--related-build id] [--related-case slug] \
 *   [--snippet-ids '["benford"]']
 *
 * Slug is auto-generated from title.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const seedPath = join(ROOT, 'scripts', 'init-db.mjs');

const REQUIRED = ['title', 'industry'];

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

function jsString(value) {
  if (value == null) return 'null';
  return JSON.stringify(value);
}

function jsonText(value, flag, fallback) {
  if (value == null || value === true) return fallback;
  try {
    JSON.parse(value);
  } catch {
    console.error(`ERROR: --${flag} must be JSON text`);
    process.exit(1);
  }
  return value;
}

const args = parseArgs(process.argv.slice(2));

for (const key of Object.keys(args)) {
  if (key.includes('-')) {
    const snake = key.replace(/-/g, '_');
    args[snake] = args[key];
    delete args[key];
  }
}

for (const req of REQUIRED) {
  if (!args[req] || args[req] === true) {
    console.error(`ERROR: --${req.replace(/_/g, '-')} is required`);
    process.exit(1);
  }
}

const source = readFileSync(seedPath, 'utf8');
const nl = source.includes('\r\n') ? '\r\n' : '\n';
const slug = slugify(args.title);

if (source.includes(`slug: '${slug}'`) || source.includes(`slug: ${JSON.stringify(slug)}`)) {
  console.error(`ERROR: A case study with slug="${slug}" already exists in scripts/init-db.mjs.`);
  process.exit(1);
}

const marker = '// __CASE_ROWS_END__';
const markerAt = source.indexOf(marker);
if (markerAt < 0) {
  console.error('ERROR: case seed marker missing in scripts/init-db.mjs');
  process.exit(1);
}

let displayOrder;
if (args.display_order == null || args.display_order === true) {
  const orders = [...source.matchAll(/display_order:\s*(\d+)/g)].map((match) => Number(match[1]));
  displayOrder = orders.length ? Math.max(...orders) + 1 : 1;
} else {
  displayOrder = Number(args.display_order);
  if (!Number.isInteger(displayOrder)) {
    console.error('ERROR: --display-order must be an integer');
    process.exit(1);
  }
}

const tier = args.tier && args.tier !== true ? args.tier : 'secondary';
const row = {
  title: args.title,
  subtitle: args.subtitle && args.subtitle !== true ? args.subtitle : null,
  industry: args.industry,
  situation: args.situation && args.situation !== true ? args.situation : null,
  task: args.task && args.task !== true ? args.task : null,
  action: args.action && args.action !== true ? args.action : null,
  result: args.result && args.result !== true ? args.result : null,
  reflection: args.reflection && args.reflection !== true ? args.reflection : null,
  impact: args.impact && args.impact !== true ? args.impact : null,
  tech_stack: jsonText(args.tech_stack, 'tech-stack', '[]'),
  categories: jsonText(args.categories, 'categories', '[]'),
  slug,
  display_order: displayOrder,
  tier,
  related_tool: args.related_tool && args.related_tool !== true ? args.related_tool : null,
  related_build: args.related_build && args.related_build !== true ? args.related_build : null,
  related_case: args.related_case && args.related_case !== true ? args.related_case : null,
  snippet_ids: jsonText(args.snippet_ids, 'snippet-ids', null),
};

const fields = [
  'title', 'subtitle', 'industry', 'situation', 'task', 'action', 'result', 'reflection', 'impact',
  'tech_stack', 'categories', 'slug', 'display_order', 'tier', 'related_tool', 'related_build', 'related_case', 'snippet_ids',
];
const lines = fields.map((key) => {
  const value = key === 'display_order' ? String(row.display_order) : jsString(row[key]);
  return `      ${key}: ${value},`;
});
const literal = `    {${nl}${lines.join(nl)}${nl}    },${nl}`;
const lineStart = source.lastIndexOf(nl, markerAt) + nl.length;
const next = source.slice(0, lineStart) + literal + source.slice(lineStart);

writeFileSync(seedPath, next);
console.log(`Appended case study: "${args.title}" → slug="${slug}" in scripts/init-db.mjs`);
