import React, { useState, useRef, useCallback } from 'react';
import { FileText, Upload, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BRAND = '#001F5B';
const BRAND_GOLD = '#C9A84C';

const LIMITATIONS = [
  'OCR (Tesseract.js): accuracy reduces on two-column layouts, tables, headers/footers, low-DPI scans, and handwriting.',
  'Excel: row or column insertion shifts cell addresses; results may show false positives in dense tables. No row-key matching in this version.',
  'DOCX: tracked changes (Track Changes) are excluded. Only the accepted final text is compared.',
  'Large files (>10 MB PDFs, multi-page scans): OCR runs on your device and may take time. Progress is shown.',
  'No export: use browser copy or screenshot for working papers.',
];

const MODAL_WEAKEN = /\b(shall|must|is required to|will be|are required to)\b/gi;
const MODAL_STRENGTHEN = /\b(should|may|can|is recommended|are recommended)\b/gi;
const RESP_KEYWORDS = /\b(director|manager|board|head|officer|ceo|cfo|cae|vp|president)\b/gi;
const SCOPE_KEYWORDS = /\b(includes|excludes|applies to|exempt|scope of|out of scope)\b/gi;

// ─── UTILS ────────────────────────────────────────────────────────────────────
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

  // Control weakened: binding → permissive
  const oldBinding = MODAL_WEAKEN.test(o); MODAL_WEAKEN.lastIndex = 0;
  const newPermissive = MODAL_STRENGTHEN.test(n); MODAL_STRENGTHEN.lastIndex = 0;
  if (oldBinding && newPermissive) tags.push('control-weakened');

  // Control strengthened: permissive → binding
  const oldPermissive = MODAL_STRENGTHEN.test(o); MODAL_STRENGTHEN.lastIndex = 0;
  const newBinding = MODAL_WEAKEN.test(n); MODAL_WEAKEN.lastIndex = 0;
  if (oldPermissive && newBinding) tags.push('control-strengthened');

  // Threshold: any numeric value changed
  const oldNums = extractNumbers(o);
  const newNums = extractNumbers(n);
  if (oldNums.length > 0 || newNums.length > 0) {
    const changed = JSON.stringify(oldNums) !== JSON.stringify(newNums);
    if (changed) tags.push('threshold');
  }

  // Responsibility
  const hasResp = RESP_KEYWORDS.test(o + ' ' + n); RESP_KEYWORDS.lastIndex = 0;
  if (hasResp) tags.push('responsibility');

  // Scope
  const hasScope = SCOPE_KEYWORDS.test(o + ' ' + n); SCOPE_KEYWORDS.lastIndex = 0;
  if (hasScope) tags.push('scope');

  return tags;
}

function isCritical(tags) {
  return tags.some(t => ['control-weakened', 'control-strengthened', 'threshold', 'scope', 'responsibility'].includes(t));
}

// ─── LCS DIFF ENGINE ──────────────────────────────────────────────────────────
function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { result.push({ type: 'equal', val: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'removed', val: a[i] }); i++; }
    else { result.push({ type: 'added', val: b[j] }); j++; }
  }
  while (i < m) { result.push({ type: 'removed', val: a[i++] }); }
  while (j < n) { result.push({ type: 'added', val: b[j++] }); }
  return result;
}

function lineDiff(oldText, newText) {
  const oldLines = oldText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const newLines = newText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const raw = lcs(oldLines, newLines);

  // Pair adjacent removed+added as 'modified'
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
      i++; // equal: skip
    }
  }
  return changes;
}

function wordDiff(oldStr, newStr) {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  return lcs(oldWords, newWords).map(e => ({ type: e.type, text: e.val }));
}

// ─── EXCEL DIFF ───────────────────────────────────────────────────────────────
function excelDiff(oldSheets, newSheets) {
  const result = {};
  const allNames = new Set([...Object.keys(oldSheets), ...Object.keys(newSheets)]);

  for (const name of allNames) {
    const changes = [];
    if (!oldSheets[name]) {
      changes.push({ cell: '(sheet)', type: 'sheet-added', old: '', new: name, tags: [] });
    } else if (!newSheets[name]) {
      changes.push({ cell: '(sheet)', type: 'sheet-removed', old: name, new: '', tags: [] });
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
          changes.push({ cell, type: 'added', old: '', new: String(n), tags: [] });
        } else if (!newCells[cell]) {
          changes.push({ cell, type: 'removed', old: String(o), new: '', tags: [] });
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

// ─── FILE DROP ZONE ───────────────────────────────────────────────────────────
function FileDropZone({ label, file, onFile, accept }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  const onDragOver = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      className={`border-2 border-dashed rounded-none cursor-pointer transition-all duration-200 p-6 text-center ${
        dragging ? 'border-[#C9A84C] bg-amber-50' : file ? 'border-[#001F5B] bg-blue-50/30' : 'border-slate-300 bg-white hover:border-[#001F5B] hover:bg-slate-50'
      }`}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <div className="flex flex-col items-center gap-2">
        {file ? (
          <>
            <FileText size={28} style={{ color: BRAND }} />
            <div className="text-sm font-bold text-[#001F5B] break-all">{file.name}</div>
            <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · click to change</div>
          </>
        ) : (
          <>
            <Upload size={28} className="text-slate-400" />
            <div className="text-sm font-semibold text-slate-600">{label}</div>
            <div className="text-xs text-slate-400">PDF · DOCX · XLSX / XLS / CSV · TXT<br/>Drag & drop or click</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── INLINE WORD DIFF ─────────────────────────────────────────────────────────
function InlineWordDiff({ oldStr, newStr }) {
  const tokens = wordDiff(oldStr, newStr);
  return (
    <span>
      {tokens.map((t, i) => {
        if (t.type === 'equal') return <span key={i}>{t.text}</span>;
        if (t.type === 'removed') return <span key={i} className="bg-red-200 text-red-800 line-through">{t.text}</span>;
        if (t.type === 'added') return <span key={i} className="bg-green-200 text-green-800 font-semibold">{t.text}</span>;
        return null;
      })}
    </span>
  );
}

// ─── CHANGE TAGS ──────────────────────────────────────────────────────────────
const TAG_STYLES = {
  'control-weakened':    'bg-red-100 text-red-700 border border-red-200',
  'control-strengthened':'bg-green-100 text-green-700 border border-green-200',
  'threshold':           'bg-orange-100 text-orange-700 border border-orange-200',
  'responsibility':      'bg-purple-100 text-purple-700 border border-purple-200',
  'scope':               'bg-blue-100 text-blue-700 border border-blue-200',
  'sheet-added':         'bg-green-100 text-green-700 border border-green-200',
  'sheet-removed':       'bg-red-100 text-red-700 border border-red-200',
};

const TAG_LABELS = {
  'control-weakened':    'Control Weakened',
  'control-strengthened':'Control Strengthened',
  'threshold':           'Threshold',
  'responsibility':      'Responsibility',
  'scope':               'Scope',
  'sheet-added':         'Sheet Added',
  'sheet-removed':       'Sheet Removed',
};

function Tags({ tags }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map(t => (
        <span key={t} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm ${TAG_STYLES[t] || 'bg-slate-100 text-slate-600'}`}>
          {TAG_LABELS[t] || t}
        </span>
      ))}
    </div>
  );
}

// ─── TEXT DIFF VIEW ───────────────────────────────────────────────────────────
function TextDiffView({ changes, filter }) {
  const filtered = changes.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'critical') return isCritical(c.tags);
    return c.type === filter;
  });

  if (filtered.length === 0) {
    return <div className="text-slate-400 text-sm text-center py-12">No changes match this filter.</div>;
  }

  return (
    <div className="space-y-2">
      {filtered.map((c, i) => {
        if (c.type === 'added') {
          return (
            <div key={i} className="bg-green-50 border-l-4 border-green-500 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Added</div>
              <div className="text-sm text-green-900">{c.new}</div>
              <Tags tags={c.tags} />
            </div>
          );
        }
        if (c.type === 'removed') {
          return (
            <div key={i} className="bg-red-50 border-l-4 border-red-500 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Removed</div>
              <div className="text-sm text-red-900 line-through">{c.old}</div>
              <Tags tags={c.tags} />
            </div>
          );
        }
        if (c.type === 'modified') {
          return (
            <div key={i} className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Modified</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Before</div>
                  <div className="text-slate-700"><InlineWordDiff oldStr={c.old} newStr={c.new} /></div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">After</div>
                  <div className="text-slate-800 font-medium">{c.new}</div>
                </div>
              </div>
              <Tags tags={c.tags} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── EXCEL DIFF VIEW ──────────────────────────────────────────────────────────
function ExcelDiffView({ diff, filter }) {
  const [activeSheet, setActiveSheet] = useState(null);
  const sheets = Object.keys(diff);
  const current = activeSheet || sheets[0];

  if (sheets.length === 0) {
    return <div className="text-slate-400 text-sm text-center py-12">No changes detected.</div>;
  }

  const rows = (diff[current] || []).filter(r => {
    if (filter === 'all') return true;
    if (filter === 'critical') return isCritical(r.tags);
    if (filter === 'added') return r.type === 'added' || r.type === 'sheet-added';
    if (filter === 'removed') return r.type === 'removed' || r.type === 'sheet-removed';
    if (filter === 'modified') return r.type === 'modified';
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-4">
        {sheets.map(s => (
          <button
            key={s}
            onClick={() => setActiveSheet(s)}
            className={`text-xs px-3 py-1 font-bold border transition-colors ${
              (current === s) ? 'bg-[#001F5B] text-white border-[#001F5B]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#001F5B]'
            }`}
          >
            {s} <span className="ml-1 opacity-60">({diff[s]?.length})</span>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="text-slate-400 text-sm text-center py-8">No changes match this filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 text-left">
                <th className="px-3 py-2 font-bold uppercase tracking-wide border border-slate-200 w-16">Cell</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wide border border-slate-200">Before</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wide border border-slate-200">After</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wide border border-slate-200 w-20">Type</th>
                <th className="px-3 py-2 font-bold uppercase tracking-wide border border-slate-200">Flags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const rowBg = r.type === 'added' ? 'bg-green-50' : r.type === 'removed' ? 'bg-red-50' : 'bg-amber-50';
                return (
                  <tr key={i} className={rowBg}>
                    <td className="px-3 py-1.5 font-mono font-bold border border-slate-200 text-slate-700">{r.cell}</td>
                    <td className={`px-3 py-1.5 border border-slate-200 ${r.type === 'removed' ? 'line-through text-red-700' : 'text-slate-600'}`}>{r.old || '(empty)'}</td>
                    <td className={`px-3 py-1.5 border border-slate-200 ${r.type === 'added' ? 'text-green-700 font-semibold' : 'text-slate-800'}`}>{r.new || '(empty)'}</td>
                    <td className="px-3 py-1.5 border border-slate-200 text-[10px] font-black uppercase tracking-wide text-slate-500">{r.type}</td>
                    <td className="px-3 py-1.5 border border-slate-200"><Tags tags={r.tags} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DocumentComparator() {
  const [oldFile, setOldFile] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [limitExpanded, setLimitExpanded] = useState(false);

  const accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';

  // ── EXTRACT: TXT ─────────────────────────────────────────────────────────
  async function extractTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read TXT file'));
      reader.readAsText(file);
    });
  }

  // ── EXTRACT: DOCX ────────────────────────────────────────────────────────
  async function extractDocx(file) {
    const mammoth = (await import('mammoth')).default;
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }

  // ── EXTRACT: PDF (native + OCR fallback) ─────────────────────────────────
  async function extractPdf(file, label) {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker path: try standard paths
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).href;
    }

    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let fullText = '';

    for (let p = 1; p <= pdf.numPages; p++) {
      setProgress(`${label}: extracting page ${p}/${pdf.numPages}…`);
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const pageText = content.items.map(i => i.str).join(' ');
      fullText += pageText + '\n';
    }

    // OCR fallback if native text is sparse
    const wordCount = fullText.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 20) {
      setProgress(`${label}: sparse text detected, running OCR…`);
      fullText = await extractPdfOcr(file, pdf, label);
    }

    return fullText;
  }

  // ── EXTRACT: PDF via OCR ─────────────────────────────────────────────────
  async function extractPdfOcr(file, pdf, label) {
    const pdfjsLib = await import('pdfjs-dist');
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(`${label}: OCR ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    let fullText = '';
    for (let p = 1; p <= pdf.numPages; p++) {
      setProgress(`${label}: OCR page ${p}/${pdf.numPages}…`);
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const { data: { text } } = await worker.recognize(canvas);
      fullText += text + '\n';
    }
    await worker.terminate();
    return fullText;
  }

  // ── EXTRACT: EXCEL ───────────────────────────────────────────────────────
  async function extractExcel(file) {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellFormula: true });
    const sheets = {};
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const cells = {};
      for (const addr of Object.keys(ws)) {
        if (addr.startsWith('!')) continue;
        const cell = ws[addr];
        // Prefer formula over displayed value
        cells[addr] = cell.f ? `=${cell.f}` : (cell.v !== undefined ? String(cell.v) : '');
      }
      sheets[name] = cells;
    }
    return sheets;
  }

  // ── DETECT FILE TYPE ─────────────────────────────────────────────────────
  function fileType(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    return 'txt';
  }

  // ── COMPARE ──────────────────────────────────────────────────────────────
  async function handleCompare() {
    if (!oldFile || !newFile) return;
    setProcessing(true);
    setResult(null);
    setError(null);
    setFilter('all');

    try {
      const typeA = fileType(oldFile);
      const typeB = fileType(newFile);
      const isExcelA = typeA === 'excel';
      const isExcelB = typeB === 'excel';

      if (isExcelA || isExcelB) {
        // Excel path
        setProgress('Reading Version A (Excel)…');
        const sheetsA = isExcelA ? await extractExcel(oldFile) : {};
        setProgress('Reading Version B (Excel)…');
        const sheetsB = isExcelB ? await extractExcel(newFile) : {};
        setProgress('Comparing cells…');
        const diff = excelDiff(sheetsA, sheetsB);

        let added = 0, removed = 0, modified = 0, critical = 0;
        for (const rows of Object.values(diff)) {
          for (const r of rows) {
            if (r.type === 'added' || r.type === 'sheet-added') added++;
            else if (r.type === 'removed' || r.type === 'sheet-removed') removed++;
            else if (r.type === 'modified') modified++;
            if (isCritical(r.tags)) critical++;
          }
        }
        setResult({ type: 'excel', diff, stats: { added, removed, modified, critical } });

      } else {
        // Text path
        setProgress('Reading Version A…');
        let textA;
        if (typeA === 'pdf') textA = await extractPdf(oldFile, 'Version A');
        else if (typeA === 'docx') textA = await extractDocx(oldFile);
        else textA = await extractTxt(oldFile);

        setProgress('Reading Version B…');
        let textB;
        if (typeB === 'pdf') textB = await extractPdf(newFile, 'Version B');
        else if (typeB === 'docx') textB = await extractDocx(newFile);
        else textB = await extractTxt(newFile);

        setProgress('Computing diff…');
        const changes = lineDiff(textA, textB);

        const stats = { added: 0, removed: 0, modified: 0, critical: 0 };
        for (const c of changes) {
          if (c.type === 'added') stats.added++;
          else if (c.type === 'removed') stats.removed++;
          else if (c.type === 'modified') stats.modified++;
          if (isCritical(c.tags)) stats.critical++;
        }
        setResult({ type: 'text', changes, stats });
      }
    } catch (err) {
      setError(err.message || 'Comparison failed. Please try again.');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  }

  function reset() {
    setOldFile(null);
    setNewFile(null);
    setResult(null);
    setError(null);
    setFilter('all');
    setProgress('');
  }

  const stats = result?.stats;
  const filterTabs = [
    { id: 'all', label: 'All', count: stats ? stats.added + stats.removed + stats.modified : 0, style: 'text-slate-700' },
    { id: 'added', label: 'Additions', count: stats?.added, style: 'text-green-700' },
    { id: 'removed', label: 'Deletions', count: stats?.removed, style: 'text-red-700' },
    { id: 'modified', label: 'Modifications', count: stats?.modified, style: 'text-amber-700' },
    { id: 'critical', label: '⚑ Critical', count: stats?.critical, style: 'text-red-700 font-black' },
  ];

  return (
    <div className="font-sans text-slate-800">

      {/* ── HEADER ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Document Intelligence</div>
          <h2 className="text-xl font-black text-[#001F5B]">Version Comparator</h2>
        </div>
        {result && (
          <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#001F5B] transition-colors">
            <RefreshCw size={13} /> New Comparison
          </button>
        )}
      </div>

      <div className="px-8 py-8">

        {/* ── UPLOAD PANEL (hidden after result) ── */}
        {!result && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <FileDropZone label="Version A: Old Document" file={oldFile} onFile={setOldFile} accept={accept} />
              <FileDropZone label="Version B: New Document" file={newFile} onFile={setNewFile} accept={accept} />
            </div>

            <div className="text-center text-xs text-slate-400 mb-6">
              All processing happens in your browser. No data is uploaded or stored.
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCompare}
                disabled={!oldFile || !newFile || processing}
                className="px-10 py-3 bg-[#001F5B] text-white text-sm font-black uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#001845] transition-colors"
              >
                {processing ? progress || 'Processing…' : 'Compare Documents'}
              </button>
            </div>

            {processing && (
              <div className="mt-4 text-center text-xs text-slate-400 animate-pulse">{progress}</div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {/* ── RESULTS ── */}
        {result && (
          <>
            {/* Limitations Banner: always visible, not dismissible */}
            <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setLimitExpanded(v => !v)}
              >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-amber-800">
                  <AlertTriangle size={14} />
                  Accuracy Limitations: Read Before Using Results
                </div>
                {limitExpanded ? <ChevronUp size={14} className="text-amber-600" /> : <ChevronDown size={14} className="text-amber-600" />}
              </button>
              {limitExpanded && (
                <ul className="mt-3 pl-4 space-y-1">
                  {LIMITATIONS.map((l, i) => (
                    <li key={i} className="text-xs text-amber-800 list-disc">{l}</li>
                  ))}
                </ul>
              )}
              {!limitExpanded && (
                <div className="text-xs text-amber-700 mt-1">{LIMITATIONS.length} limitations apply. Click to expand.</div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Additions', val: stats.added, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                { label: 'Deletions', val: stats.removed, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                { label: 'Modifications', val: stats.modified, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                { label: 'Critical', val: stats.critical, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
              ].map(s => (
                <div key={s.label} className={`border px-4 py-3 ${s.bg}`}>
                  <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-100 pb-4">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-1.5 text-xs font-bold border transition-all ${
                    filter === tab.id
                      ? 'bg-[#001F5B] text-white border-[#001F5B]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#001F5B] hover:text-[#001F5B]'
                  } ${tab.id === 'critical' && stats.critical > 0 && filter !== 'critical' ? 'border-red-300' : ''}`}
                >
                  {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-70">({tab.count})</span>}
                </button>
              ))}
            </div>

            {/* Files Summary */}
            <div className="flex gap-4 mb-6 text-xs text-slate-500">
              <span><span className="font-bold text-slate-700">A:</span> {oldFile?.name}</span>
              <span className="text-slate-300">→</span>
              <span><span className="font-bold text-slate-700">B:</span> {newFile?.name}</span>
            </div>

            {/* Diff View */}
            {result.type === 'text'
              ? <TextDiffView changes={result.changes} filter={filter} />
              : <ExcelDiffView diff={result.diff} filter={filter} />
            }

            {/* Reset at bottom */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button onClick={reset} className="px-8 py-2.5 border border-[#001F5B] text-[#001F5B] text-xs font-bold uppercase tracking-widest hover:bg-[#001F5B] hover:text-white transition-colors">
                New Comparison
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
