/**
 * Stress test for DocumentComparator pure functions.
 * Inlines exact implementations from:
 *   src/components/DocumentComparator.jsx
 *
 * Run:  node tests/document-comparator.test.js
 */

'use strict';

// ─── EXACT COPIES OF PURE FUNCTIONS FROM SOURCE ───────────────────────────────

const MODAL_WEAKEN   = /\b(shall|must|is required to|will be|are required to)\b/gi;
const MODAL_STRENGTHEN = /\b(should|may|can|is recommended|are recommended)\b/gi;
const RESP_KEYWORDS  = /\b(director|manager|board|head|officer|ceo|cfo|cae|vp|president)\b/gi;
const SCOPE_KEYWORDS = /\b(includes|excludes|applies to|exempt|scope of|out of scope)\b/gi;

function hasNumber(str) {
  return /\d/.test(str);
}

function extractNumbers(str) {
  return (str.match(/[\d,.]+/g) || []).map(s => parseFloat(s.replace(/,/g, ''))).filter(n => !isNaN(n));
}

function classifyChange(oldText, newText) {
  const tags = [];
  const o = (oldText || '').toLowerCase();
  const n = (newText || '').toLowerCase();

  const oldBinding    = MODAL_WEAKEN.test(o);     MODAL_WEAKEN.lastIndex = 0;
  const newPermissive = MODAL_STRENGTHEN.test(n); MODAL_STRENGTHEN.lastIndex = 0;
  if (oldBinding && newPermissive) tags.push('control-weakened');

  const oldPermissive = MODAL_STRENGTHEN.test(o); MODAL_STRENGTHEN.lastIndex = 0;
  const newBinding    = MODAL_WEAKEN.test(n);     MODAL_WEAKEN.lastIndex = 0;
  if (oldPermissive && newBinding) tags.push('control-strengthened');

  const oldNums = extractNumbers(o);
  const newNums = extractNumbers(n);
  if (oldNums.length > 0 || newNums.length > 0) {
    const changed = JSON.stringify(oldNums) !== JSON.stringify(newNums);
    if (changed) tags.push('threshold');
  }

  const hasResp = RESP_KEYWORDS.test(o + ' ' + n); RESP_KEYWORDS.lastIndex = 0;
  if (hasResp) tags.push('responsibility');

  const hasScope = SCOPE_KEYWORDS.test(o + ' ' + n); SCOPE_KEYWORDS.lastIndex = 0;
  if (hasScope) tags.push('scope');

  return tags;
}

function isCritical(tags) {
  return tags.some(t =>
    ['control-weakened', 'control-strengthened', 'threshold', 'scope', 'responsibility'].includes(t)
  );
}

function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { result.push({ type: 'equal',   val: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'removed', val: a[i] }); i++; }
    else { result.push({ type: 'added', val: b[j] }); j++; }
  }
  while (i < m) { result.push({ type: 'removed', val: a[i++] }); }
  while (j < n) { result.push({ type: 'added',   val: b[j++] }); }
  return result;
}

function lineDiff(oldText, newText) {
  const oldLines = oldText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const newLines = newText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const raw = lcs(oldLines, newLines);

  const changes = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i].type === 'removed' && i + 1 < raw.length && raw[i + 1].type === 'added') {
      const tags = classifyChange(raw[i].val, raw[i + 1].val);
      changes.push({ type: 'modified', old: raw[i].val, new: raw[i + 1].val, tags });
      i += 2;
    } else if (raw[i].type === 'removed') {
      const tags = classifyChange(raw[i].val, '');
      changes.push({ type: 'removed', old: raw[i].val, new: '', tags });
      i++;
    } else if (raw[i].type === 'added') {
      const tags = classifyChange('', raw[i].val);
      changes.push({ type: 'added', old: '', new: raw[i].val, tags });
      i++;
    } else {
      i++;
    }
  }
  return changes;
}

function wordDiff(oldStr, newStr) {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  return lcs(oldWords, newWords).map(e => ({ type: e.type, text: e.val }));
}

function excelDiff(oldSheets, newSheets) {
  const result = {};
  const allNames = new Set([...Object.keys(oldSheets), ...Object.keys(newSheets)]);

  for (const name of allNames) {
    const changes = [];
    if (!oldSheets[name]) {
      changes.push({ cell: '—', type: 'sheet-added', old: '', new: name, tags: [] });
    } else if (!newSheets[name]) {
      changes.push({ cell: '—', type: 'sheet-removed', old: name, new: '', tags: [] });
    } else {
      const oldCells = oldSheets[name];
      const newCells = newSheets[name];
      const allCells = new Set([...Object.keys(oldCells), ...Object.keys(newCells)]);
      const sorted = [...allCells].sort((a, b) => {
        const parseAddr = addr => {
          const m = addr.match(/^([A-Z]+)(\d+)$/);
          if (!m) return [0, 0];
          const col = m[1].split('').reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0);
          return [parseInt(m[2], 10), col];
        };
        const [ra, ca] = parseAddr(a);
        const [rb, cb] = parseAddr(b);
        return ra !== rb ? ra - rb : ca - cb;
      });

      for (const cell of sorted) {
        const o = oldCells[cell] ?? '';
        const n = newCells[cell] ?? '';
        if (o === n) continue;
        if (!oldCells[cell]) {
          changes.push({ cell, type: 'added',    old: '',       new: String(n), tags: [] });
        } else if (!newCells[cell]) {
          changes.push({ cell, type: 'removed',  old: String(o), new: '',       tags: [] });
        } else {
          const tags = classifyChange(String(o), String(n));
          changes.push({ cell, type: 'modified', old: String(o), new: String(n), tags });
        }
      }
    }
    if (changes.length > 0) result[name] = changes;
  }
  return result;
}

// ─── TEST HARNESS ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function assert(label, actual, expected) {
  const ok = deepEqual(actual, expected);
  if (ok) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    console.log(`         expected: ${JSON.stringify(expected)}`);
    console.log(`         actual:   ${JSON.stringify(actual)}`);
    failed++;
    failures.push(label);
  }
}

function assertIncludes(label, actual, expected) {
  // actual is array; expected is array — check superset
  const ok = expected.every(e => actual.includes(e)) && actual.every(e => expected.includes(e));
  if (ok) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    console.log(`         expected: ${JSON.stringify(expected)}`);
    console.log(`         actual:   ${JSON.stringify(actual)}`);
    failed++;
    failures.push(label);
  }
}

function assertBool(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    console.log(`         expected: ${expected}`);
    console.log(`         actual:   ${actual}`);
    failed++;
    failures.push(label);
  }
}

function assertNoThrow(label, fn) {
  try {
    fn();
    console.log(`  PASS  ${label} (no crash)`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${label} — threw: ${e.message}`);
    failed++;
    failures.push(label);
  }
}

// ─── SECTION: classifyChange ──────────────────────────────────────────────────
console.log('\n═══ classifyChange ═══');

assert(
  'shall → should = control-weakened',
  classifyChange('shall review', 'should review'),
  ['control-weakened']
);

assert(
  'should → shall = control-strengthened',
  classifyChange('should review', 'shall review'),
  ['control-strengthened']
);

assert(
  'limit 100,000 → 150,000 = threshold',
  classifyChange('limit is 100,000', 'limit is 150,000'),
  ['threshold']
);

assert(
  'director → manager = responsibility',
  classifyChange('the director is responsible', 'the manager is responsible'),
  ['responsibility']
);

assert(
  '"applies to all staff" → "excludes contractors" = scope',
  classifyChange('applies to all staff', 'excludes contractors'),
  ['scope']
);

// Added line: empty old, no modal in new = no control tag; no numbers; no resp/scope keywords
assert(
  'empty old + new text (no keywords) = []',
  classifyChange('', 'new text added'),
  []
);

assert(
  'identical text = []',
  classifyChange('same text', 'same text'),
  []
);

assert(
  'both empty = []',
  classifyChange('', ''),
  []
);

// Multi-tag: shall→may (weakened), 50k→75k (threshold), director→manager (responsibility)
// Note: the source also adds 'responsibility' because RESP_KEYWORDS checks combined old+new string
assertIncludes(
  'multi-change: control-weakened + threshold + responsibility',
  classifyChange(
    'shall comply and limit is 50,000 and director signs',
    'may comply and limit is 75,000 and manager signs'
  ),
  ['control-weakened', 'threshold', 'responsibility']
);

assert(
  'plain text no numbers no modals = []',
  classifyChange('a b c', 'a b c'),
  []
);

// Modal in middle of sentence
assert(
  'modal mid-sentence: "shall be reviewed" → "should be reviewed" = control-weakened',
  classifyChange(
    'This policy shall be reviewed annually',
    'This policy should be reviewed annually'
  ),
  ['control-weakened']
);

// must → can = control-weakened
assert(
  'must → can = control-weakened',
  classifyChange('staff must submit', 'staff can submit'),
  ['control-weakened']
);

// is required to → is recommended = control-weakened
assert(
  '"is required to" → "is recommended" = control-weakened',
  classifyChange('the officer is required to report', 'the officer is recommended to report'),
  ['control-weakened', 'responsibility']
);

// Numbers: same value different format — 1,000 and 1000 both parse to 1000 → no threshold
assert(
  '"1,000" vs "1000" — same parsed value → no threshold',
  classifyChange('limit is 1,000', 'limit is 1000'),
  []
);

// Different numbers in AED context → threshold
assert(
  '"1,000 AED" vs "2,000 AED" → threshold',
  classifyChange('limit is 1,000 AED', 'limit is 2,000 AED'),
  ['threshold']
);

// No old text but new has numbers → threshold (oldNums=[], newNums=[42], changed=true)
assert(
  'empty old, new has number → threshold',
  classifyChange('', 'limit is 42'),
  ['threshold']
);

// Scope keyword on its own
assert(
  '"scope of" present → scope tag',
  classifyChange('this is the scope of review', 'this is the scope of assessment'),
  ['scope']
);

// ─── SECTION: isCritical ─────────────────────────────────────────────────────
console.log('\n═══ isCritical ═══');

assertBool('[] → false',                     isCritical([]),                     false);
assertBool('[threshold] → true',             isCritical(['threshold']),           true);
assertBool('[control-weakened] → true',      isCritical(['control-weakened']),    true);
assertBool('[control-strengthened] → true',  isCritical(['control-strengthened']),true);
assertBool('[responsibility] → true',        isCritical(['responsibility']),      true);
assertBool('[scope] → true',                 isCritical(['scope']),               true);
assertBool('[threshold, scope] → true',      isCritical(['threshold', 'scope']),  true);
assertBool('[unknown-tag] → false',          isCritical(['unknown-tag']),         false);

// ─── SECTION: lcs ────────────────────────────────────────────────────────────
console.log('\n═══ lcs ═══');

// Identical arrays
assert(
  'lcs identical arrays = all equal',
  lcs(['a', 'b', 'c'], ['a', 'b', 'c']),
  [
    { type: 'equal', val: 'a' },
    { type: 'equal', val: 'b' },
    { type: 'equal', val: 'c' },
  ]
);

// Empty both
assert('lcs both empty = []', lcs([], []), []);

// Empty a
assert(
  'lcs empty a = all added',
  lcs([], ['x', 'y']),
  [{ type: 'added', val: 'x' }, { type: 'added', val: 'y' }]
);

// Empty b
assert(
  'lcs empty b = all removed',
  lcs(['x', 'y'], []),
  [{ type: 'removed', val: 'x' }, { type: 'removed', val: 'y' }]
);

// One substitution
assert(
  'lcs one substitution',
  lcs(['a', 'b', 'c'], ['a', 'x', 'c']),
  [
    { type: 'equal',   val: 'a' },
    { type: 'removed', val: 'b' },
    { type: 'added',   val: 'x' },
    { type: 'equal',   val: 'c' },
  ]
);

// ─── SECTION: lineDiff ───────────────────────────────────────────────────────
console.log('\n═══ lineDiff ═══');

// Identical text → 0 changes
assert(
  'identical text → 0 changes',
  lineDiff('Line one\nLine two\nLine three', 'Line one\nLine two\nLine three'),
  []
);

// One line added
{
  const r = lineDiff('Line one\nLine two', 'Line one\nLine two\nLine three');
  assert('one line added → 1 addition', r.length, 1);
  assert('one line added → type=added', r[0].type, 'added');
  assert('one line added → new text correct', r[0].new, 'Line three');
}

// One line removed
{
  const r = lineDiff('Line one\nLine two\nLine three', 'Line one\nLine three');
  assert('one line removed → 1 deletion', r.length, 1);
  assert('one line removed → type=removed', r[0].type, 'removed');
  assert('one line removed → old text correct', r[0].old, 'Line two');
}

// One line changed → modified (adjacent removed+added)
{
  const r = lineDiff('The cat sat on the mat', 'The dog sat on the mat');
  assert('one line changed → 1 modification', r.length, 1);
  assert('one line changed → type=modified', r[0].type, 'modified');
}

// Empty old, non-empty new → all additions
{
  const r = lineDiff('', 'First line\nSecond line');
  assert('empty old → 2 additions', r.length, 2);
  assert('empty old → all type=added', r.every(c => c.type === 'added'), true);
}

// Non-empty old, empty new → all removals
{
  const r = lineDiff('First line\nSecond line', '');
  assert('empty new → 2 removals', r.length, 2);
  assert('empty new → all type=removed', r.every(c => c.type === 'removed'), true);
}

// Blank lines should be filtered
{
  const r = lineDiff('Line one\n\n\nLine two', 'Line one\n\n\nLine two');
  assert('blank lines filtered → identical = 0 changes', r.length, 0);
}

// Blank lines between changed content
{
  const r = lineDiff(
    'Header\n\nLine A\nLine B\n\nFooter',
    'Header\n\nLine A\nLine B modified\n\nFooter'
  );
  assert('blank lines filtered, one line changed → 1 change', r.length, 1);
  assert('blank lines filtered, one line changed → modified', r[0].type, 'modified');
}

// Multiple changes in a longer document (10 lines, 3 changed)
{
  const oldDoc = [
    'Introduction paragraph.',
    'Section 1: Overview.',
    'Section 2: Scope — applies to all.',
    'Section 3: Responsibilities.',
    'The director shall approve.',
    'Section 4: Procedures.',
    'Threshold is 50,000.',
    'Section 5: Review.',
    'Review frequency: annual.',
    'Conclusion.',
  ].join('\n');

  const newDoc = [
    'Introduction paragraph.',
    'Section 1: Overview.',
    'Section 2: Scope — applies to all.',
    'Section 3: Responsibilities.',
    'The manager should approve.',    // changed
    'Section 4: Procedures.',
    'Threshold is 75,000.',           // changed
    'Section 5: Review.',
    'Review frequency: quarterly.',   // changed
    'Conclusion.',
  ].join('\n');

  const r = lineDiff(oldDoc, newDoc);
  assert('10-line doc, 3 changes → 3 modifications', r.length, 3);
  assert('10-line doc → all modified', r.every(c => c.type === 'modified'), true);

  // First change: director→manager (responsibility) + shall→should (control-weakened)
  assertIncludes(
    '10-line: line 5 tags = control-weakened + responsibility',
    r[0].tags,
    ['control-weakened', 'responsibility']
  );

  // Second change: 50,000→75,000 (threshold)
  assertIncludes(
    '10-line: line 7 tags = threshold',
    r[1].tags,
    ['threshold']
  );
}

// Single word difference produces 'modified' not separate add/remove
{
  const r = lineDiff('The cat sat on the mat.', 'The dog sat on the mat.');
  assert('single word diff → type=modified (not add+remove)', r.length, 1);
  assert('single word diff → type=modified', r[0].type, 'modified');
}

// ─── SECTION: wordDiff ───────────────────────────────────────────────────────
console.log('\n═══ wordDiff ═══');

// "hello world" vs "hello earth"
{
  const r = wordDiff('hello world', 'hello earth');
  // Split by (\s+): ['hello', ' ', 'world'] vs ['hello', ' ', 'earth']
  const equalTokens   = r.filter(t => t.type === 'equal');
  const removedTokens = r.filter(t => t.type === 'removed');
  const addedTokens   = r.filter(t => t.type === 'added');

  assert('wordDiff: "hello world"→"hello earth" has equal tokens', equalTokens.length >= 1, true);
  assert('wordDiff: removed contains "world"', removedTokens.some(t => t.text === 'world'), true);
  assert('wordDiff: added contains "earth"',   addedTokens.some(t => t.text === 'earth'),   true);
  assert('wordDiff: equal contains "hello"',   equalTokens.some(t => t.text === 'hello'),   true);
}

// Identical strings → all equal
{
  const r = wordDiff('audit report', 'audit report');
  assert('wordDiff identical → all equal', r.every(t => t.type === 'equal'), true);
}

// Completely different
{
  const r = wordDiff('abc def', 'xyz uvw');
  const equalTokens = r.filter(t => t.type === 'equal');
  // Spaces might match as equal tokens — that is correct behaviour
  const contentEqual = equalTokens.filter(t => t.text.trim() !== '');
  assert('wordDiff completely different → no equal content tokens', contentEqual.length, 0);
}

// Empty strings
assert('wordDiff both empty → single equal empty token', wordDiff('', ''), [{ type: 'equal', text: '' }]);

// ─── SECTION: excelDiff ──────────────────────────────────────────────────────
console.log('\n═══ excelDiff ═══');

// Identical sheets → 0 changes (result object empty)
{
  const r = excelDiff(
    { Sheet1: { A1: 'Hello', B1: '100' } },
    { Sheet1: { A1: 'Hello', B1: '100' } }
  );
  assert('identical sheets → empty result', Object.keys(r).length, 0);
}

// Cell value changed → modified
{
  const r = excelDiff(
    { Sheet1: { A1: '100' } },
    { Sheet1: { A1: '200' } }
  );
  assert('cell changed → Sheet1 has 1 change', r['Sheet1'].length, 1);
  assert('cell changed → type=modified', r['Sheet1'][0].type, 'modified');
  assertIncludes('cell numeric change → threshold tag', r['Sheet1'][0].tags, ['threshold']);
}

// Cell added (present in new, absent in old)
{
  const r = excelDiff(
    { Sheet1: { A1: 'Hello' } },
    { Sheet1: { A1: 'Hello', B2: 'New value' } }
  );
  assert('cell added → 1 change', r['Sheet1'].length, 1);
  assert('cell added → type=added', r['Sheet1'][0].type, 'added');
  assert('cell added → cell ref correct', r['Sheet1'][0].cell, 'B2');
}

// Cell removed (present in old, absent in new)
{
  const r = excelDiff(
    { Sheet1: { A1: 'Hello', B2: 'Old value' } },
    { Sheet1: { A1: 'Hello' } }
  );
  assert('cell removed → 1 change', r['Sheet1'].length, 1);
  assert('cell removed → type=removed', r['Sheet1'][0].type, 'removed');
}

// New sheet added
{
  const r = excelDiff(
    { Sheet1: { A1: 'x' } },
    { Sheet1: { A1: 'x' }, Sheet2: { A1: 'y' } }
  );
  assert('new sheet added → Sheet2 in result', 'Sheet2' in r, true);
  assert('new sheet added → type=sheet-added', r['Sheet2'][0].type, 'sheet-added');
}

// Old sheet removed
{
  const r = excelDiff(
    { Sheet1: { A1: 'x' }, Sheet2: { A1: 'y' } },
    { Sheet1: { A1: 'x' } }
  );
  assert('sheet removed → Sheet2 in result', 'Sheet2' in r, true);
  assert('sheet removed → type=sheet-removed', r['Sheet2'][0].type, 'sheet-removed');
}

// Cell with "shall" → "may" → control-weakened
{
  const r = excelDiff(
    { Sheet1: { A1: 'Approver shall sign' } },
    { Sheet1: { A1: 'Approver may sign' } }
  );
  assert('cell shall→may → modified', r['Sheet1'][0].type, 'modified');
  assertIncludes('cell shall→may → control-weakened', r['Sheet1'][0].tags, ['control-weakened']);
}

// Multiple sheets, changes in each
{
  const r = excelDiff(
    {
      Sheet1: { A1: '100', B1: 'old' },
      Sheet2: { A1: 'same', C3: 'to delete' },
    },
    {
      Sheet1: { A1: '200', B1: 'old' },
      Sheet2: { A1: 'same', C3: undefined },
    }
  );
  assert('multi-sheet changes → Sheet1 has 1 change', r['Sheet1'].length, 1);
  assert('multi-sheet changes → Sheet1 change is threshold', r['Sheet1'][0].tags.includes('threshold'), true);
  // Sheet2: C3 present in old with value, undefined in new — undefined coerces to '' so old != new
  assert('multi-sheet changes → Sheet2 has changes', (r['Sheet2'] || []).length >= 1, true);
}

// Empty old sheets, non-empty new → all additions
{
  const r = excelDiff(
    { Sheet1: {} },
    { Sheet1: { A1: 'x', B1: 'y', C1: 'z' } }
  );
  assert('empty old sheet → 3 additions', r['Sheet1'].length, 3);
  assert('empty old sheet → all type=added', r['Sheet1'].every(c => c.type === 'added'), true);
}

// Sort order: B2 before B10, A1 before B1
{
  const r = excelDiff(
    { Sheet1: { B10: 'old10', B2: 'old2', A1: 'oldA1', B1: 'oldB1' } },
    { Sheet1: { B10: 'new10', B2: 'new2', A1: 'newA1', B1: 'newB1' } }
  );
  const cells = r['Sheet1'].map(c => c.cell);
  const idxA1  = cells.indexOf('A1');
  const idxB1  = cells.indexOf('B1');
  const idxB2  = cells.indexOf('B2');
  const idxB10 = cells.indexOf('B10');
  assert('sort: A1 before B1',  idxA1 < idxB1,  true);
  assert('sort: B2 before B10', idxB2 < idxB10, true);
  assert('sort: B1 before B2',  idxB1 < idxB2,  true);
}

// ─── SECTION: Edge cases ─────────────────────────────────────────────────────
console.log('\n═══ Edge cases ═══');

// Very long text: 1000 lines each, 500 identical + 500 changed
{
  const shared = Array.from({ length: 500 }, (_, i) => `Shared line ${i}`).join('\n');
  const oldUnique = Array.from({ length: 500 }, (_, i) => `Old unique line ${i}`).join('\n');
  const newUnique = Array.from({ length: 500 }, (_, i) => `New unique line ${i}`).join('\n');
  const oldDoc = shared + '\n' + oldUnique;
  const newDoc = shared + '\n' + newUnique;

  assertNoThrow('1000-line stress test: no crash', () => {
    const r = lineDiff(oldDoc, newDoc);
    // The LCS algorithm emits a block of 500 removed followed by 500 added.
    // lineDiff's pairing logic only collapses ONE adjacent removed+added pair into
    // 'modified'; the remaining 499 removed and 499 added stay separate.
    // Expected: 1 modified + 499 removed + 499 added = 999 total changes.
    const total    = r.length;
    const modified = r.filter(c => c.type === 'modified').length;
    const removed  = r.filter(c => c.type === 'removed').length;
    const added    = r.filter(c => c.type === 'added').length;
    if (total !== 999) throw new Error(`Expected 999 total changes, got ${total}`);
    if (modified !== 1)  throw new Error(`Expected 1 modified, got ${modified}`);
    if (removed  !== 499) throw new Error(`Expected 499 removed, got ${removed}`);
    if (added    !== 499) throw new Error(`Expected 499 added, got ${added}`);
  });
}

// Unicode text: classifyChange should not crash
assertNoThrow(
  'Unicode Arabic text: no crash',
  () => classifyChange('يجب أن يوافق المدير', 'ينبغي أن يوافق المدير')
);

assertNoThrow(
  'Unicode mixed: no crash in lineDiff',
  () => lineDiff('مرحبا بالعالم\nHello World', 'مرحبا\nHello World')
);

// Special characters
assertNoThrow(
  'Special chars in classifyChange: no crash',
  () => classifyChange('cost < $1,000 & fees > 0%', 'cost < $2,000 & fees > 5%')
);

// No changes → empty stats counts (0+0+0+0)
{
  const changes = lineDiff('Identical content here', 'Identical content here');
  const stats = { added: 0, removed: 0, modified: 0, critical: 0 };
  for (const c of changes) {
    if (c.type === 'added')    stats.added++;
    if (c.type === 'removed')  stats.removed++;
    if (c.type === 'modified') stats.modified++;
    if (isCritical(c.tags))   stats.critical++;
  }
  assert('no changes → stats all zero', stats, { added: 0, removed: 0, modified: 0, critical: 0 });
}

// "will be" is a MODAL_WEAKEN term
assert(
  '"will be required" → "may be required" = control-weakened',
  classifyChange('review will be completed', 'review may be completed'),
  ['control-weakened']
);

// "are required to" → "are recommended" = control-weakened
assert(
  '"are required to" → "are recommended" = control-weakened',
  classifyChange('staff are required to report incidents', 'staff are recommended to report incidents'),
  ['control-weakened']
);

// Numbers only in old (removal) → threshold
assert(
  'number only in old → threshold',
  classifyChange('maximum of 5 approvals', ''),
  ['threshold']
);

// out of scope keyword
assert(
  '"out of scope" → scope tag',
  classifyChange('contractors are out of scope', 'contractors are in scope'),
  ['scope']
);

// Both modals present: shall AND should in old (binding wins? Test actual behaviour)
// old has "shall" (weaken) AND "should" (strengthen) — both checks can fire
{
  const tags = classifyChange('staff shall and should comply', 'staff shall comply');
  // oldBinding=true, newPermissive=false → no control-weakened
  // oldPermissive=true, newBinding=true → control-strengthened
  assertIncludes(
    'old has both shall+should, new has only shall → control-strengthened',
    tags,
    ['control-strengthened']
  );
}

// Numeric zero-value edge case
assert(
  '"0" vs "1" → threshold',
  classifyChange('limit is 0', 'limit is 1'),
  ['threshold']
);

// Empty sheets both → no result
{
  const r = excelDiff({}, {});
  assert('both sheets empty objects → empty result', Object.keys(r).length, 0);
}

// excelDiff: same cell address, same value but different types (number vs string)
// Source: cells[addr] = cell.v !== undefined ? String(cell.v) : '' — always string
// So "100" === "100" → no change
{
  const r = excelDiff({ Sheet1: { A1: '100' } }, { Sheet1: { A1: '100' } });
  assert('same string value → no change', Object.keys(r).length, 0);
}

// wordDiff: single character change
{
  const r = wordDiff('cat', 'bat');
  // 'cat' vs 'bat' — no space split, treated as single token each
  const removed = r.filter(t => t.type === 'removed');
  const added   = r.filter(t => t.type === 'added');
  assert('wordDiff single-word change → has removed', removed.length, 1);
  assert('wordDiff single-word change → has added',   added.length,   1);
  assert('wordDiff: removed="cat"', removed[0].text, 'cat');
  assert('wordDiff: added="bat"',   added[0].text,   'bat');
}

// isCritical: array with mixed unknown and critical
assertBool('[unknown, threshold] → true', isCritical(['unknown', 'threshold']), true);

// classifyChange: 'exempt' triggers scope.
// old="managers are exempt..." has no permissive modal (should/may/can/etc.),
// so control-strengthened does NOT fire — only scope fires.
assert(
  '"exempt" → scope tag only (no control-strengthened, old lacks permissive modal)',
  classifyChange('managers are exempt from this policy', 'managers must comply'),
  ['scope']
);

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`RESULTS:  ${passed} passed,  ${failed} failed  (total: ${passed + failed})`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  - ${f}`));
}
console.log('═'.repeat(60));
process.exit(failed > 0 ? 1 : 0);
