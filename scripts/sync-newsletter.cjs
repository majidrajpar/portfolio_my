#!/usr/bin/env node
// Fetches the latest 3 articles from the LinkedIn newsletter page
// and writes them to src/data/newsletter.json
// Requires Node 18+ (uses built-in fetch)

const fs = require('fs');
const path = require('path');

const NEWSLETTER_URL = 'https://www.linkedin.com/newsletters/7339153291630510080/';
const OUTPUT_FILE = path.join(__dirname, '../src/data/newsletter.json');

function classifyArticle(title) {
  const t = title.toLowerCase();
  if (/fraud|heist|theft|embezzl|forensic|investigat|misappropriat|signal/.test(t))
    return { tag: 'Fraud Forensics', tagColor: 'text-red-400 bg-red-500/10 border-red-500/20' };
  if (/ipo|listing|tadawul|dfm|nomu|cma|prospectus|capital raise/.test(t))
    return { tag: 'IPO Governance', tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  if (/board|governance|committee|director|chair/.test(t))
    return { tag: 'Board Advisory', tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  if (/data|analytic|automat|\bai\b|machine learn|python|technolog|digital/.test(t))
    return { tag: 'Data & Analytics', tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (/inventor|supply chain|procurement|operation|warehouse|logistics/.test(t))
    return { tag: 'Operations Risk', tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (/risk|compliance|control|audit|internal/.test(t))
    return { tag: 'Audit & Risk', tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  return { tag: 'Thought Leadership', tagColor: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

async function main() {
  console.log('Fetching LinkedIn newsletter...');

  let html;
  try {
    const res = await fetch(NEWSLETTER_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    html = await res.text();
  } catch (err) {
    console.error('Failed to fetch newsletter page:', err.message);
    process.exit(1);
  }

  // LinkedIn uses <a ...><h3 ...>Article Title</h3></a> for article listings
  const titles = [];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let match;

  while ((match = h3Regex.exec(html)) !== null) {
    const text = decodeEntities(
      match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    );
    // Must be at least 15 chars and not a UI/nav element
    if (
      text.length >= 15 &&
      !/(subscribe|follow|sign in|join now|newsletter|more from|articles|see all)/i.test(text)
    ) {
      titles.push(text);
    }
    if (titles.length >= 3) break;
  }

  if (titles.length === 0) {
    console.error(
      'No article titles found — LinkedIn may have changed its HTML structure.\n' +
      'The existing newsletter.json has been left unchanged.'
    );
    process.exit(1);
  }

  console.log(`Found ${titles.length} article(s):`);
  titles.forEach((t) => console.log(`  - ${t}`));

  const articles = titles.map((title) => ({ title, ...classifyArticle(title) }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2) + '\n');
  console.log(`\nUpdated ${OUTPUT_FILE}`);
}

main();
