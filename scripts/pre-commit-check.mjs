#!/usr/bin/env node

/**
 * Pre-Commit Continuous Controls Gate
 *
 * Inspects staged files prior to commit:
 * 1. Prohibits binary commercial deliverables (.xlsx, .zip, .docx, .pbix, .tar.gz).
 * 2. Prohibits credential leaks (Discord/Slack webhooks, private keys, API secrets).
 * 3. Prohibits local workstation paths in src/ and public/.
 * 4. Enforces declarative allowlist for any files staged into public/downloads/.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PROHIBITED_BINARY_EXTENSIONS = ['.xlsx', '.zip', '.docx', '.pbix', '.tar.gz', '.tgz'];

const CREDENTIAL_PATTERNS = [
  { name: 'Discord Webhook', regex: /https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/i },
  { name: 'Slack Webhook', regex: /https?:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+/i },
  { name: 'GitHub Token', regex: /(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/ },
  { name: 'OpenAI Secret Key', regex: /sk-proj-[a-zA-Z0-9_-]{40,}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
];

const LOCAL_PATH_PATTERNS = [
  { name: 'Local Workstation File URI', regex: new RegExp(['file:', '///', 'C:', '/Users/'].join(''), 'i'), scope: /^(src|public)\// },
  { name: 'Absolute Workstation Path in Source', regex: new RegExp(['(?:[a-zA-Z]:\\\\Users\\\\|[a-zA-Z]:\\/Users\\/)'].join(''), 'i'), scope: /^(src|public)\// },
];

let stagedFilesOutput = '';
try {
  stagedFilesOutput = execSync('git diff --cached --name-only --diff-filter=ACM', {
    cwd: rootDir,
    encoding: 'utf8',
  }).trim();
} catch (err) {
  console.error('Error querying staged files from git:', err.message);
  process.exit(1);
}

if (!stagedFilesOutput) {
  process.exit(0);
}

const stagedFiles = stagedFilesOutput.split(/\r?\n/).filter(Boolean);
const errors = [];

// Load allowlist
let allowedDownloads = new Set();
const allowlistPath = path.join(rootDir, 'scripts', 'security-allowlist.json');
if (fs.existsSync(allowlistPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    const arr = Array.isArray(raw) ? raw : raw.allowedFiles;
    if (Array.isArray(arr)) {
      allowedDownloads = new Set(arr);
    }
  } catch {
    // Ignore load errors here, audit-gate will catch them
  }
}

for (const relPath of stagedFiles) {
  const normalizedRelPath = relPath.replace(/\\/g, '/');
  const lowerPath = normalizedRelPath.toLowerCase();

  // 1. Check prohibited binary extensions
  for (const ext of PROHIBITED_BINARY_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) {
      errors.push({
        type: 'PROHIBITED_BINARY_STAGED',
        file: relPath,
        detail: `Binary asset staging blocked. Files matching ${ext} must never be committed to git history.`,
      });
    }
  }

  // 2. Downloads directory allowlist check
  if (normalizedRelPath.startsWith('public/downloads/')) {
    const fileName = path.basename(normalizedRelPath);
    if (!allowedDownloads.has(fileName)) {
      errors.push({
        type: 'UNLISTED_DOWNLOAD_STAGED',
        file: relPath,
        detail: `File '${fileName}' is not declared in scripts/security-allowlist.json.`,
      });
    }
  }

  // 3. Inspect text content from git index
  let content = null;
  try {
    content = execSync(`git show :${normalizedRelPath}`, {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    // Binary or unreadable file in index
    content = null;
  }

  if (typeof content === 'string') {
    for (const pat of CREDENTIAL_PATTERNS) {
      if (pat.regex.test(content)) {
        errors.push({
          type: 'CREDENTIAL_STAGED',
          file: relPath,
          detail: `${pat.name} detected in staged content.`,
        });
      }
    }

    for (const pat of LOCAL_PATH_PATTERNS) {
      if (pat.scope && !pat.scope.test(normalizedRelPath)) {
        continue;
      }
      if (pat.regex.test(content)) {
        errors.push({
          type: 'LOCAL_PATH_STAGED',
          file: relPath,
          detail: `${pat.name} detected in staged content.`,
        });
      }
    }
  }
}

// 4. If metadata files or downloads were staged, run the full audit gate
const triggersFullAudit = stagedFiles.some(f => {
  const norm = f.replace(/\\/g, '/');
  return norm.startsWith('public/downloads/') ||
         norm === 'src/data/documents.json' ||
         norm === 'src/data/software.js' ||
         norm === 'scripts/security-allowlist.json';
});

if (triggersFullAudit && errors.length === 0) {
  try {
    execSync('node scripts/audit-security-gate.mjs', { cwd: rootDir, stdio: 'inherit' });
  } catch {
    errors.push({
      type: 'AUDIT_GATE_FAILED',
      file: 'scripts/audit-security-gate.mjs',
      detail: 'Continuous controls assertion gate failed on staged changes.',
    });
  }
}

if (errors.length > 0) {
  console.error('\n' + '!'.repeat(72));
  console.error(' PRE-COMMIT HOOK REJECTED: Security & Integrity Violations Detected');
  console.error('!'.repeat(72));
  for (const err of errors) {
    console.error(` [${err.type}] ${err.file}`);
    console.error(`   ${err.detail}`);
  }
  console.error('!'.repeat(72));
  console.error('Commit aborted. Remediate findings before committing.\n');
  process.exit(1);
}

process.exit(0);
