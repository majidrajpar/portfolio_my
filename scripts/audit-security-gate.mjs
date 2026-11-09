#!/usr/bin/env node

/**
 * Continuous Controls Monitoring (CCM) Security Assertion Gate
 *
 * Enforces three automated integrity invariants:
 * 1. Zero commercial binary leaks (.xlsx, .zip, .docx, .pbix) in documents.json, software.js, and downloads directories.
 * 2. Strict declarative allowlist verification for public/downloads and dist/downloads.
 * 3. Zero credential disclosures (Discord/Slack webhooks) and zero local workstation paths in src/ and dist/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PROHIBITED_BINARY_EXTENSIONS = ['.xlsx', '.zip', '.docx', '.pbix', '.tar.gz', '.tgz'];

const WEBHOOK_PATTERNS = [
  { name: 'Discord Webhook', regex: /https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/i },
  { name: 'Slack Webhook', regex: /https?:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+/i },
];

const LOCAL_PATH_PATTERNS = [
  { name: 'Local Workstation File URI', regex: new RegExp(['file:', '///', 'C:', '/Users/'].join(''), 'i') },
];

const TEXT_EXTENSIONS_TO_SCAN = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.astro',
  '.json', '.html', '.css', '.md', '.mdx', '.txt', '.xml', '.svg'
]);

const errors = [];
const telemetry = {
  documentsChecked: 0,
  softwareChecked: 0,
  publicDownloadsChecked: 0,
  distDownloadsChecked: 0,
  srcFilesScanned: 0,
  distFilesScanned: 0,
};

function recordError(category, message, details = null) {
  errors.push({ category, message, details });
}

// -----------------------------------------------------------------------------
// Control 1: Declarative Allowlist Loading
// -----------------------------------------------------------------------------
const allowlistPath = path.join(rootDir, 'scripts', 'security-allowlist.json');
if (!fs.existsSync(allowlistPath)) {
  recordError('CONFIGURATION', `Security allowlist missing at: ${path.relative(rootDir, allowlistPath)}`);
}

let allowedDownloads = new Set();
try {
  const allowlistContent = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
  const fileArray = Array.isArray(allowlistContent) ? allowlistContent : allowlistContent.allowedFiles;
  if (!Array.isArray(fileArray)) {
    recordError('CONFIGURATION', 'security-allowlist.json must contain an array or allowedFiles array property.');
  } else {
    allowedDownloads = new Set(fileArray);
  }
} catch (err) {
  recordError('CONFIGURATION', `Failed to parse security-allowlist.json: ${err.message}`);
}

// -----------------------------------------------------------------------------
// Control 2: Commercial Linkage Audit (documents.json & software.js)
// -----------------------------------------------------------------------------
const documentsJsonPath = path.join(rootDir, 'src', 'data', 'documents.json');
if (fs.existsSync(documentsJsonPath)) {
  try {
    const documents = JSON.parse(fs.readFileSync(documentsJsonPath, 'utf8'));
    telemetry.documentsChecked = documents.length;

    for (const doc of documents) {
      const docId = doc.id || 'unknown';
      const targetFiles = [doc.downloadUrl, doc.filename].filter(Boolean);

      for (const target of targetFiles) {
        const lower = target.toLowerCase();
        for (const ext of PROHIBITED_BINARY_EXTENSIONS) {
          if (lower.endsWith(ext)) {
            recordError('COMMERCIAL_LEAK', `Prohibited binary referenced in documents.json [${docId}]: ${target}`);
          }
        }
      }

      // Assert that paid items (isFree === false) only point to .md overview files
      if (doc.isFree === false) {
        if (doc.downloadUrl && !doc.downloadUrl.toLowerCase().endsWith('.md')) {
          recordError('COMMERCIAL_GATE', `Commercial document [${docId}] downloadUrl must point to a .md overview file, got: ${doc.downloadUrl}`);
        }
        if (doc.filename && !doc.filename.toLowerCase().endsWith('.md')) {
          recordError('COMMERCIAL_GATE', `Commercial document [${docId}] filename must point to a .md overview file, got: ${doc.filename}`);
        }
      }

      // If downloadUrl is specified for any item with a gumroadUrl, assert it points to markdown overview
      if (doc.gumroadUrl && doc.downloadUrl && !doc.downloadUrl.toLowerCase().endsWith('.md')) {
        recordError('COMMERCIAL_GATE', `Paid suite [${docId}] downloadUrl must point to a .md overview, got: ${doc.downloadUrl}`);
      }
    }
  } catch (err) {
    recordError('PARSER_FAILURE', `Failed reading documents.json: ${err.message}`);
  }
} else {
  recordError('CONFIGURATION', `documents.json not found at: ${path.relative(rootDir, documentsJsonPath)}`);
}

const softwareJsPath = path.join(rootDir, 'src', 'data', 'software.js');
if (fs.existsSync(softwareJsPath)) {
  try {
    const swModule = await import(pathToFileURL(softwareJsPath).href);
    const softwareList = swModule.software || [];
    telemetry.softwareChecked = softwareList.length;

    for (const item of softwareList) {
      const swId = item.id || 'unknown';
      const downloadUrl = item.downloadUrl;

      if (downloadUrl) {
        const lower = downloadUrl.toLowerCase();
        for (const ext of PROHIBITED_BINARY_EXTENSIONS) {
          if (lower.endsWith(ext)) {
            recordError('COMMERCIAL_LEAK', `Prohibited binary referenced in software.js [${swId}]: ${downloadUrl}`);
          }
        }

        // Paid software products must only provide .md overview files
        if (item.gumroadUrl || item.isFree === false) {
          if (!lower.endsWith('.md')) {
            recordError('COMMERCIAL_GATE', `Commercial software [${swId}] downloadUrl must point to a .md overview, got: ${downloadUrl}`);
          }
        }
      }
    }
  } catch (err) {
    recordError('PARSER_FAILURE', `Failed evaluating software.js: ${err.message}`);
  }
} else {
  recordError('CONFIGURATION', `software.js not found at: ${path.relative(rootDir, softwareJsPath)}`);
}

// -----------------------------------------------------------------------------
// Control 3: Downloads Directory Allowlist & Binary Isolation
// -----------------------------------------------------------------------------
function auditDownloadsDirectory(dirPath, label, counterKey) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      telemetry[counterKey]++;
      const fileName = entry.name;
      const lower = fileName.toLowerCase();

      // Check binary extensions
      for (const ext of PROHIBITED_BINARY_EXTENSIONS) {
        if (lower.endsWith(ext)) {
          recordError('BINARY_PRESENT', `Prohibited binary file discovered in ${label}: ${fileName}`);
        }
      }

      // Check allowlist
      if (!allowedDownloads.has(fileName)) {
        recordError('ALLOWLIST_VIOLATION', `Unregistered file discovered in ${label}: ${fileName}`);
      }
    }
  }
}

auditDownloadsDirectory(path.join(rootDir, 'public', 'downloads'), 'public/downloads', 'publicDownloadsChecked');
auditDownloadsDirectory(path.join(rootDir, 'dist', 'downloads'), 'dist/downloads', 'distDownloadsChecked');

// -----------------------------------------------------------------------------
// Control 4: Secret & Workstation Absolute Path Scanner
// -----------------------------------------------------------------------------
function scanDirectoryForPatterns(dirPath, isDist = false) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDirectoryForPatterns(fullPath, isDist);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (TEXT_EXTENSIONS_TO_SCAN.has(ext)) {
        if (isDist) telemetry.distFilesScanned++;
        else telemetry.srcFilesScanned++;

        try {
          const content = fs.readFileSync(fullPath, 'utf8');

          for (const pattern of WEBHOOK_PATTERNS) {
            if (pattern.regex.test(content)) {
              recordError('SECRET_DISCLOSURE', `${pattern.name} detected in: ${path.relative(rootDir, fullPath)}`);
            }
          }

          for (const pattern of LOCAL_PATH_PATTERNS) {
            if (pattern.regex.test(content)) {
              recordError('PATH_LEAK', `${pattern.name} detected in: ${path.relative(rootDir, fullPath)}`);
            }
          }
        } catch {
          // Binary or unreadable text ignored
        }
      }
    }
  }
}

scanDirectoryForPatterns(path.join(rootDir, 'src'), false);
scanDirectoryForPatterns(path.join(rootDir, 'dist'), true);

// -----------------------------------------------------------------------------
// Verdict Issuance & Reporting
// -----------------------------------------------------------------------------
console.log('='.repeat(72));
console.log(' CONTINUOUS CONTROLS MONITORING (CCM) - SECURITY ASSERTION GATE');
console.log('='.repeat(72));
console.log(` Documents Evaluated:        ${telemetry.documentsChecked}`);
console.log(` Software Products Evaluated: ${telemetry.softwareChecked}`);
console.log(` Public Downloads Verified:   ${telemetry.publicDownloadsChecked} (Allowlist size: ${allowedDownloads.size})`);
if (telemetry.distDownloadsChecked > 0) {
  console.log(` Dist Downloads Verified:     ${telemetry.distDownloadsChecked}`);
}
console.log(` Source Files Scanned:       ${telemetry.srcFilesScanned}`);
if (telemetry.distFilesScanned > 0) {
  console.log(` Dist Files Scanned:         ${telemetry.distFilesScanned}`);
}
console.log('-'.repeat(72));

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} security control violation(s) detected:\n`);
  for (const err of errors) {
    console.error(` [${err.category}] ${err.message}`);
    if (err.details) console.error(`   Details: ${err.details}`);
  }
  console.error('\nIssuance blocked. Resolve violations before committing or building.');
  process.exit(1);
}

console.log('VERDICT: PASSED. 100% assertions satisfied. No leaks, unlisted files, or credentials detected.');
console.log('='.repeat(72));
process.exit(0);
