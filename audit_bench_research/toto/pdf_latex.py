"""
Professional LaTeX PDF Generation for Internal Audit Documents.
XeLaTeX + DejaVu Sans. Complete markdown-to-LaTeX conversion.
"""

from pathlib import Path
import subprocess
import re

XELATEX = r"C:\Users\sorat\AppData\Local\Programs\MiKTeX\miktex\bin\x64\xelatex.exe"


# ---------------------------------------------------------------------------
# Text Processing
# ---------------------------------------------------------------------------

def _escape_tex(text: str) -> str:
    """Escape raw text for LaTeX."""
    text = text.replace('\\', '\\textbackslash{}')
    text = text.replace('{', '\\{')
    text = text.replace('}', '\\}')
    text = text.replace('&', '\\u0026')
    text = text.replace('%', '\\%')
    text = text.replace('$', '\\$')
    text = text.replace('#', '\\#')
    text = text.replace('_', '\\_')
    text = text.replace('~', '\\textasciitilde{}')
    text = text.replace('^', '\\textasciicircum{}')
    text = text.replace('<', '\\textless{}')
    text = text.replace('>', '\\textgreater{}')
    return text


def _process_inline(text: str) -> str:
    """
    Convert markdown bold **text**, italic *text*, and headers ### Header
    to LaTeX. Uses placeholder system to protect commands from escaping.
    """
    if not isinstance(text, str):
        text = str(text)

    placeholders = []
    counter = [0]

    def store(cmd):
        ph = f"ZZZPH{counter[0]}ZZZ"
        placeholders.append((ph, cmd))
        counter[0] += 1
        return ph

    # Remove markdown headers: ### text → plain text (will be handled by section structure)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Also inline headers like "### Description:" 
    text = re.sub(r'#{1,6}\s*', '', text)

    # Bold: **text**
    def sub_bold(m):
        return store(r"\textbf{" + m.group(1) + "}")

    # Italic: *text*
    def sub_italic(m):
        return store(r"\textit{" + m.group(1) + "}")

    text = re.sub(r'\*\*(.+?)\*\*', sub_bold, text)
    text = re.sub(r'(?<![*])\*(?!\*)(.+?)(?<!\*)\*(?!\*)', sub_italic, text)

    # Escape remaining text
    text = _escape_tex(text)

    # Restore placeholders
    for ph, cmd in placeholders:
        text = text.replace(ph, cmd)

    return text


def process_multiline(text: str) -> str:
    """
    Convert multi-line text: strip markdown headers, convert bold/italic,
    handle bullet lists, format paragraphs cleanly.
    """
    if not text or not isinstance(text, str):
        return ""

    # First, strip leading markdown headers from each line
    lines = []
    for line in text.split('\n'):
        stripped = line.strip()
        # Remove markdown headers completely
        stripped = re.sub(r'^#{1,6}\s+', '', stripped)
        lines.append(stripped)

    text = '\n'.join(lines)

    result = []
    in_bullet = False
    in_numbered = False

    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped:
            if in_bullet:
                result.append(r'\end{itemize}')
                in_bullet = False
            if in_numbered:
                result.append(r'\end{enumerate}')
                in_numbered = False
            continue

        # Bullet list
        if stripped.startswith('- ') or stripped.startswith('* '):
            if in_numbered:
                result.append(r'\end{enumerate}')
                in_numbered = False
            if not in_bullet:
                result.append(r'\begin{itemize}[leftmargin=1.5em]')
                in_bullet = True
            content = _process_inline(stripped[2:])
            result.append(f'    \\item {content}')
            continue

        # Numbered list
        num_match = re.match(r'(\d+)\.\s+(.+)', stripped)
        if num_match:
            if in_bullet:
                result.append(r'\end{itemize}')
                in_bullet = False
            if not in_numbered:
                result.append(r'\begin{enumerate}[leftmargin=1.5em]')
                in_numbered = True
            content = _process_inline(num_match.group(2))
            result.append(f'    \\item {content}')
            continue

        # Regular line
        if in_bullet:
            result.append(r'\end{itemize}')
            in_bullet = False
        if in_numbered:
            result.append(r'\end{enumerate}')
            in_numbered = False

        result.append(_process_inline(stripped))

    if in_bullet:
        result.append(r'\end{itemize}')
    if in_numbered:
        result.append(r'\end{enumerate}')

    return '\n\n'.join(result)


# ---------------------------------------------------------------------------
# Compilation
# ---------------------------------------------------------------------------

def compile_tex(tex_path: Path, keep_tex: bool = True) -> Path:
    tex_path = Path(tex_path)
    pdf_path = tex_path.with_suffix('.pdf')
    print(f"  [XeLaTeX] Compiling {tex_path.name}...")
    for _ in range(2):
        subprocess.run(
            [XELATEX, '-interaction=nonstopmode', '-output-directory', str(tex_path.parent), str(tex_path)],
            capture_output=True, text=True, timeout=60,
        )
    if pdf_path.exists():
        print(f"  [XeLaTeX] PDF generated: {pdf_path}")
        # Clean up auxiliary files (keep .tex for Director review)
        for ext in ['.aux', '.log', '.out']:
            aux = tex_path.with_suffix(ext)
            if aux.exists():
                aux.unlink()
        return pdf_path
    else:
        print(f"  [XeLaTeX] ERROR: PDF not generated")
        return None


def cleanup_tex(tex_path: Path):
    """Remove .tex file after Director approval."""
    tex_path = Path(tex_path)
    if tex_path.exists():
        tex_path.unlink()
        print(f"  [CLEANUP] Removed {tex_path.name}")


def write_tex(content: str, filepath: Path):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(content, encoding='utf-8')


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

def make_header(doc_type: str, date: str) -> str:
    e_type = _process_inline(doc_type)
    e_date = _process_inline(date)
    return (
        r"\documentclass[11pt,a4paper]{article}" + "\n"
        r"\usepackage{fontspec}" + "\n"
        r"\setmainfont{DejaVu Sans}" + "\n"
        r"\usepackage[margin=2.5cm]{geometry}" + "\n"
        r"\usepackage{graphicx}" + "\n"
        r"\usepackage{xcolor}" + "\n"
        r"\usepackage{booktabs}" + "\n"
        r"\usepackage{longtable}" + "\n"
        r"\usepackage{array}" + "\n"
        r"\usepackage{fancyhdr}" + "\n"
        r"\usepackage{lastpage}" + "\n"
        r"\usepackage{enumitem}" + "\n"
        r"\usepackage{titlesec}" + "\n"
        r"\usepackage{setspace}" + "\n\n"
        r"\setstretch{1.15}" + "\n\n"
        r"\definecolor{auditblue}{RGB}{30,60,90}" + "\n"
        r"\definecolor{auditgray}{RGB}{120,120,120}" + "\n"
        r"\definecolor{confidential}{RGB}{180,0,0}" + "\n"
        r"\definecolor{criticalred}{RGB}{200,50,50}" + "\n"
        r"\definecolor{highorange}{RGB}{230,120,50}" + "\n"
        r"\definecolor{mediumyellow}{RGB}{230,180,50}" + "\n"
        r"\definecolor{lowgreen}{RGB}{50,150,80}" + "\n\n"
        r"\pagestyle{fancy}" + "\n"
        r"\fancyhf{}" + "\n"
        r"\fancyhead[L]{\small\textcolor{auditgray}{" + e_type + r" | CONFIDENTIAL | INTERNAL USE ONLY}}" + "\n"
        r"\fancyhead[R]{\small\textcolor{auditgray}{Page \thepage\ of \pageref{LastPage}}}" + "\n"
        r"\fancyfoot[C]{\small\textcolor{auditgray}{Generated: " + e_date + r"}}" + "\n"
        r"\renewcommand{\headrulewidth}{0.4pt}" + "\n\n"
        r"\titleformat{\section}{\Large\bfseries\color{auditblue}}{\thesection}{1em}{}" + "\n"
        r"\titleformat{\subsection}{\large\bfseries\color{auditblue}}{\thesubsection}{1em}{}" + "\n"
        r"\titleformat{\subsubsection}{\normalsize\bfseries\color{auditblue}}{\thesubsubsection}{1em}{}" + "\n\n"
        r"\begin{document}" + "\n"
    )

DOC_FOOTER = r"""\end{document}"""


def make_title_page(title: str, subtitle: str = "", metadata: dict = None) -> str:
    lines = [
        r"\begin{titlepage}",
        r"\centering",
        r"\vspace*{1.5cm}",
        r"{\color{auditblue}\rule{0.8\textwidth}{2pt}}",
        r"\vspace{1cm}",
        r"{\Huge\bfseries\color{auditblue}" + _process_inline(title) + r"}",
        r"\vspace{0.5cm}",
    ]
    if subtitle:
        lines.append(r"{\Large\color{auditgray}" + _process_inline(subtitle) + r"}")
        lines.append(r"\vspace{0.3cm}")
    lines.append(r"{\color{auditblue}\rule{0.8\textwidth}{2pt}}")
    lines.append(r"\vspace{1.5cm}")
    if metadata:
        for k, v in metadata.items():
            lines.append(r"{\large " + _process_inline(k) + r": " + _process_inline(v) + r"}\par")
            lines.append(r"\vspace{0.2cm}")
    lines.append(r"\vfill")
    lines.append(r"{\large\color{confidential}\textbf{CONFIDENTIAL --- INTERNAL USE ONLY}}")
    lines.append(r"\end{titlepage}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Document Generators
# ---------------------------------------------------------------------------

def gen_planning_memo(memo_text: str, meta: dict, filepath: Path) -> Path:
    header = make_header("Planning Document", meta.get("Date", "2026-07-01"))
    body = make_title_page(
        "INTERNAL AUDIT PLANNING MEMO",
        "Q3 2026 F\u0026B Warehouse Operations Audit",
        meta
    ) + r"\newpage" + "\n\n"
    body += r"\section{Engagement Overview}" + "\n\n"
    body += process_multiline(memo_text)
    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_engagement_letter(letter_text: str, filepath: Path) -> Path:
    header = make_header("Communication", "2026-07-01")
    meta = {"Date": "2026-07-01", "To": "Warehouse Operations Director", "From": "Internal Audit Director"}
    body = make_title_page(
        "INTERNAL AUDIT ENGAGEMENT LETTER",
        "F\u0026B Warehouse Operations --- Q3 2026",
        meta
    ) + r"\newpage" + "\n\n"
    body += process_multiline(letter_text)
    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_risk_matrix(risks: list, filepath: Path) -> Path:
    header = make_header("Planning Document", "2026-07-01")
    body = make_title_page(
        "RISK ASSESSMENT MATRIX",
        "Q3 2026 F\u0026B Warehouse Operations"
    ) + r"\newpage" + "\n\n"

    body += r"\section{Inherent Risk versus Control Effectiveness}" + "\n\n"
    body += "The following matrix identifies key risk areas for the F\u0026B warehouse operation, rated by inherent risk level and current control effectiveness." + "\n\n"

    body += r"\begin{longtable}{>{\raggedright\arraybackslash}p{4cm} c c c c}" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Risk Area} \u0026 \textbf{Inherent Risk} \u0026 \textbf{Control Effectiveness} \u0026 \textbf{Residual Risk} \u0026 \textbf{Priority} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfirsthead" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Risk Area} \u0026 \textbf{Inherent Risk} \u0026 \textbf{Control Effectiveness} \u0026 \textbf{Residual Risk} \u0026 \textbf{Priority} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endhead" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfoot" + "\n"
    body += r"\bottomrule" + "\n"
    body += r"\endlastfoot" + "\n"
    for r in risks:
        body += f"    {_process_inline(r['area'])} \u0026 {_process_inline(r['inherent'])} \u0026 {_process_inline(r['control'])} \u0026 {_process_inline(r['residual'])} \u0026 {_process_inline(r['priority'])} \\\n"
    body += r"\end{longtable}" + "\n\n"

    body += r"\section{Risk Descriptions}" + "\n\n"
    for r in risks:
        body += r"\subsection{" + _process_inline(r['area']) + r"}" + "\n\n"
        body += r"\textbf{Priority:} " + _process_inline(r['priority']) + r"\\" + "\n\n"
        body += r"\textbf{Description:} " + process_multiline(r.get('description', 'N/A')) + r"\\" + "\n\n"
        body += r"\textbf{Mitigation:} " + process_multiline(r.get('mitigation', 'N/A')) + r"\\" + "\n\n"

    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_working_paper(title: str, objective: str, procedures: list, evidence: list,
                      results: str, conclusion: str, filepath: Path) -> Path:
    header = make_header("Working Paper", "2026-07-15")
    body = make_title_page(
        title.upper(),
        "F\u0026B Warehouse Operations Audit --- Q3 2026",
        {"Prepared By": "Internal Audit Team", "Date": "2026-07-15"}
    ) + r"\newpage" + "\n\n"

    body += r"\section{Objective}" + "\n\n" + process_multiline(objective) + "\n\n"
    body += r"\section{Test Procedures}" + "\n\n"
    body += r"\begin{enumerate}[leftmargin=1.5em]" + "\n"
    for p in procedures:
        body += f"    \\item {_process_inline(p)}\n"
    body += r"\end{enumerate}" + "\n\n"

    body += r"\section{Evidence Summary}" + "\n\n"
    body += r"\begin{itemize}[leftmargin=1.5em]" + "\n"
    for e in evidence:
        body += f"    \\item {_process_inline(e)}\n"
    body += r"\end{itemize}" + "\n\n"

    body += r"\section{Results}" + "\n\n" + process_multiline(results) + "\n\n"
    body += r"\section{Conclusion}" + "\n\n" + process_multiline(conclusion) + "\n"

    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_findings_register(findings: list, filepath: Path) -> Path:
    header = make_header("Finding Document", "2026-07-20")
    body = make_title_page(
        "AUDIT FINDINGS REGISTER",
        "Q3 2026 F\u0026B Warehouse Operations Audit"
    ) + r"\newpage" + "\n\n"

    body += r"\section{Findings Summary}" + "\n\n"
    body += r"\begin{longtable}{>{\raggedright\arraybackslash}p{1.5cm} p{3cm} c p{5cm} c}" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Ref} \u0026 \textbf{Area} \u0026 \textbf{Rating} \u0026 \textbf{Title} \u0026 \textbf{Status} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfirsthead" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Ref} \u0026 \textbf{Area} \u0026 \textbf{Rating} \u0026 \textbf{Title} \u0026 \textbf{Status} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endhead" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfoot" + "\n"
    body += r"\bottomrule" + "\n"
    body += r"\endlastfoot" + "\n"
    for f in findings:
        body += f"    {_process_inline(f['ref'])} \u0026 {_process_inline(f['area'])} \u0026 {_process_inline(f['rating'])} \u0026 {_process_inline(f['title'])} \u0026 {_process_inline(f['status'])} \\\n"
    body += r"\end{longtable}" + "\n\n"

    body += r"\newpage" + "\n"
    body += r"\section{Detailed Findings}" + "\n\n"
    for f in findings:
        color = {
            "Critical": "criticalred",
            "High": "highorange",
            "Medium": "mediumyellow",
            "Low": "lowgreen"
        }.get(f['rating'], "auditgray")

        body += r"\subsection{" + _process_inline(f['ref']) + r": " + _process_inline(f['title']) + r"}" + "\n\n"
        body += r"\textcolor{" + color + r"}{\textbf{" + _process_inline(f['rating']) + r"}}} | " + _process_inline(f['area']) + r" | Status: " + _process_inline(f['status']) + r"\\" + "\n\n"
        body += r"\textbf{Description:} " + process_multiline(f['description']) + r"\\" + "\n\n"
        body += r"\textbf{Root Cause:} " + process_multiline(f['root_cause']) + r"\\" + "\n\n"
        body += r"\textbf{Recommendation:} " + process_multiline(f['recommendation']) + r"\\" + "\n\n"
        body += r"\textbf{Management Response:} " + process_multiline(f.get('management_response', 'Pending')) + r"\\" + "\n\n"
        body += r"\noindent\rule{\textwidth}{0.4pt}" + "\n\n"

    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_audit_report(report: dict, filepath: Path) -> Path:
    header = make_header("Final Report", report.get("date", "2026-07-20"))
    body = make_title_page(
        "INTERNAL AUDIT REPORT",
        "F\u0026B Warehouse Operations --- Q3 2026",
        {"Report Date": report.get("date", "2026-07-20"), "Report Number": report.get("number", "IAR-2026-03")}
    ) + r"\newpage" + "\n\n"

    body += r"\section{Executive Summary}" + "\n\n" + process_multiline(report.get("executive_summary", "")) + "\n\n"
    body += r"\section{Scope and Objectives}" + "\n\n" + process_multiline(report.get("scope", "")) + "\n\n"
    body += r"\section{Key Findings Summary}" + "\n\n" + process_multiline(report.get("findings_summary", "")) + "\n\n"

    body += r"\newpage" + "\n"
    body += r"\section{Detailed Findings and Recommendations}" + "\n\n"
    for f in report.get("detailed_findings", []):
        body += r"\subsection{" + _process_inline(f['ref']) + r": " + _process_inline(f['title']) + r"}" + "\n\n"
        body += r"\textbf{Rating:} " + _process_inline(f['rating']) + r"\\" + "\n\n"
        body += process_multiline(f['description']) + r"\\" + "\n\n"
        body += r"\textbf{Recommendation:} " + process_multiline(f['recommendation']) + r"\\" + "\n\n"
        body += r"\noindent\rule{\textwidth}{0.4pt}" + "\n\n"

    body += r"\newpage" + "\n"
    body += r"\section{Management Response}" + "\n\n" + process_multiline(report.get("management_response", "")) + "\n\n"
    body += r"\section{Overall Conclusion}" + "\n\n" + process_multiline(report.get("overall_conclusion", "")) + "\n"

    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)


def gen_follow_up_tracker(actions: list, filepath: Path) -> Path:
    header = make_header("Follow-Up", "2026-07-20")
    body = make_title_page(
        "MANAGEMENT ACTION PLAN TRACKER",
        "Q3 2026 F\u0026B Warehouse Operations Audit",
        {"Created": "2026-07-20", "Next Review": "2026-10-20"}
    ) + r"\newpage" + "\n\n"

    body += r"\section{Action Items Summary}" + "\n\n"
    body += r"\begin{longtable}{>{\raggedright\arraybackslash}p{2cm} p{2cm} p{5cm} p{2.5cm} p{2cm} p{2cm}}" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Action ID} \u0026 \textbf{Finding Ref} \u0026 \textbf{Description} \u0026 \textbf{Owner} \u0026 \textbf{Due Date} \u0026 \textbf{Status} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfirsthead" + "\n"
    body += r"\toprule" + "\n"
    body += r"\textbf{Action ID} \u0026 \textbf{Finding Ref} \u0026 \textbf{Description} \u0026 \textbf{Owner} \u0026 \textbf{Due Date} \u0026 \textbf{Status} \\" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endhead" + "\n"
    body += r"\midrule" + "\n"
    body += r"\endfoot" + "\n"
    body += r"\bottomrule" + "\n"
    body += r"\endlastfoot" + "\n"
    for a in actions:
        body += f"    {_process_inline(a['id'])} \u0026 {_process_inline(a['finding_ref'])} \u0026 {_process_inline(a['description'][:60])} \u0026 {_process_inline(a['owner'])} \u0026 {_process_inline(a['due_date'])} \u0026 {_process_inline(a['status'])} \\\n"
    body += r"\end{longtable}" + "\n\n"

    body += r"\newpage" + "\n"
    body += r"\section{Detailed Action Items}" + "\n\n"
    for a in actions:
        body += r"\subsection{" + _process_inline(a['id']) + r"}" + "\n\n"
        body += r"\textbf{Linked Finding:} " + _process_inline(a['finding_ref']) + r"\\" + "\n\n"
        body += r"\textbf{Description:} " + process_multiline(a['description']) + r"\\" + "\n\n"
        body += r"\textbf{Owner:} " + _process_inline(a['owner']) + r"\\" + "\n\n"
        body += r"\textbf{Due Date:} " + _process_inline(a['due_date']) + r"\\" + "\n\n"
        body += r"\textbf{Status:} " + _process_inline(a['status']) + r"\\" + "\n\n"
        body += r"\textbf{Notes:} " + process_multiline(a.get('notes', 'None')) + r"\\" + "\n\n"
        body += r"\noindent\rule{\textwidth}{0.4pt}" + "\n\n"

    tex_path = filepath.with_suffix(".tex")
    write_tex(header + body + "\n\n" + DOC_FOOTER, tex_path)
    return compile_tex(tex_path)
