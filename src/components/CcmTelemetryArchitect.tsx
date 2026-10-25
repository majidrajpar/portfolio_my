import React, { useState, useMemo } from 'react';
import {
  Database,
  Filter,
  Code2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  DollarSign
} from 'lucide-react';

export type BusinessCycle = 'p2p' | 'o2c' | 'gl' | 'payroll';
export type SqlDialect = 'postgres' | 'snowflake' | 'bigquery' | 'oracle';

export interface CcmRule {
  id: string;
  name: string;
  cycle: BusinessCycle;
  cycleName: string;
  objective: string;
  riskDescription: string;
  primaryTables: string[];
  defaultThreshold: number;
  thresholdUnit: string;
  thresholdLabel: string;
  lookbackDays: number;
  tolerancePct: number;
  severity: 'Critical' | 'High' | 'Medium';
  queries: Record<SqlDialect, string>;
  mockExceptions: {
    id: string;
    timestamp: string;
    entity: string;
    amount: number;
    detail: string;
    riskScore: number;
  }[];
}

const RULES: CcmRule[] = [
  {
    id: 'p2p-split-po',
    name: 'Split Purchase Orders Below DOA Threshold',
    cycle: 'p2p',
    cycleName: 'Procure-to-Pay (P2P)',
    objective: 'Detect circumvention of Delegation of Authority (DOA) approval limits through clustered purchase orders.',
    riskDescription: 'Buyers artificially fragment large purchases into multiple sub-threshold orders within a tight time window to bypass senior management or Board tender committee approval.',
    primaryTables: ['PO_HEADERS', 'PO_LINES', 'VENDOR_MASTER'],
    defaultThreshold: 50000,
    thresholdUnit: 'AED / USD',
    thresholdLabel: 'DOA Approval Tier Limit',
    lookbackDays: 3,
    tolerancePct: 10,
    severity: 'Critical',
    mockExceptions: [
      { id: 'EX-901', timestamp: '2026-10-22 14:12', entity: 'Vendor: Apex Tech FZE (Buyer: #4092)', amount: 48500, detail: '3 POs totaling 145,500 within 48h to same vendor. Single PO threshold is 50,000.', riskScore: 94 },
      { id: 'EX-902', timestamp: '2026-10-23 09:30', entity: 'Vendor: Gulf Office Supplies (Buyer: #1105)', amount: 49200, detail: '2 POs totaling 98,400 within 24h. Bypasses CFO secondary approval gate.', riskScore: 88 },
      { id: 'EX-903', timestamp: '2026-10-24 16:45', entity: 'Vendor: Redline Logistics (Buyer: #3021)', amount: 47800, detail: 'Split freight orders created 4 hours apart with identical delivery destination.', riskScore: 82 },
    ],
    queries: {
      postgres: `-- PostgreSQL / DuckDB Dialect
-- Detects split POs created for the same vendor within rolling 72h below threshold
WITH clustered_pos AS (
    SELECT 
        p.buyer_id,
        p.vendor_id,
        v.vendor_name,
        p.po_number,
        p.po_date,
        p.total_amount,
        SUM(p.total_amount) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date 
            RANGE BETWEEN INTERVAL '3 days' PRECEDING AND CURRENT ROW
        ) AS rolling_vendor_spend,
        COUNT(p.po_number) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date 
            RANGE BETWEEN INTERVAL '3 days' PRECEDING AND CURRENT ROW
        ) AS rolling_po_count
    FROM po_headers p
    JOIN vendor_master v ON p.vendor_id = v.vendor_id
    WHERE p.status NOT IN ('CANCELLED', 'REJECTED')
      -- Flag POs sitting just below DOA limit (e.g., within 10% of 50,000)
      AND p.total_amount BETWEEN (50000 * 0.90) AND 50000
)
SELECT 
    buyer_id,
    vendor_name,
    po_number,
    po_date,
    total_amount,
    rolling_vendor_spend,
    rolling_po_count
FROM clustered_pos
WHERE rolling_po_count > 1
ORDER BY rolling_vendor_spend DESC;`,

      snowflake: `-- Snowflake Dialect
WITH clustered_pos AS (
    SELECT 
        p.buyer_id,
        p.vendor_id,
        v.vendor_name,
        p.po_number,
        p.po_date,
        p.total_amount,
        SUM(p.total_amount) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date::TIMESTAMP_NTZ 
            RANGE BETWEEN INTERVAL '3 DAYS' PRECEDING AND CURRENT ROW
        ) AS rolling_vendor_spend,
        COUNT(p.po_number) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date::TIMESTAMP_NTZ 
            RANGE BETWEEN INTERVAL '3 DAYS' PRECEDING AND CURRENT ROW
        ) AS rolling_po_count
    FROM PO_HEADERS p
    JOIN VENDOR_MASTER v ON p.vendor_id = v.vendor_id
    WHERE p.status NOT IN ('CANCELLED', 'REJECTED')
      AND p.total_amount BETWEEN (50000 * 0.90) AND 50000
)
SELECT *
FROM clustered_pos
WHERE rolling_po_count > 1
ORDER BY rolling_vendor_spend DESC;`,

      bigquery: `-- Google BigQuery Dialect
WITH clustered_pos AS (
    SELECT 
        p.buyer_id,
        p.vendor_id,
        v.vendor_name,
        p.po_number,
        p.po_date,
        p.total_amount,
        SUM(p.total_amount) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY UNIX_DATE(DATE(p.po_date))
            RANGE BETWEEN 3 PRECEDING AND CURRENT ROW
        ) AS rolling_vendor_spend,
        COUNT(p.po_number) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY UNIX_DATE(DATE(p.po_date))
            RANGE BETWEEN 3 PRECEDING AND CURRENT ROW
        ) AS rolling_po_count
    FROM \`enterprise_erp.po_headers\` p
    JOIN \`enterprise_erp.vendor_master\` v ON p.vendor_id = v.vendor_id
    WHERE p.status NOT IN ('CANCELLED', 'REJECTED')
      AND p.total_amount BETWEEN (50000 * 0.90) AND 50000
)
SELECT *
FROM clustered_pos
WHERE rolling_po_count > 1
ORDER BY rolling_vendor_spend DESC;`,

      oracle: `-- Oracle SQL Dialect
WITH ranked_pos AS (
    SELECT 
        p.buyer_id,
        p.vendor_id,
        v.vendor_name,
        p.po_number,
        p.po_date,
        p.total_amount,
        COUNT(p.po_number) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date 
            RANGE BETWEEN NUMTODSINTERVAL(3, 'DAY') PRECEDING AND CURRENT ROW
        ) AS rolling_po_count,
        SUM(p.total_amount) OVER (
            PARTITION BY p.buyer_id, p.vendor_id 
            ORDER BY p.po_date 
            RANGE BETWEEN NUMTODSINTERVAL(3, 'DAY') PRECEDING AND CURRENT ROW
        ) AS rolling_vendor_spend
    FROM PO_HEADERS p
    JOIN VENDOR_MASTER v ON p.vendor_id = v.vendor_id
    WHERE p.status NOT IN ('CANCELLED', 'REJECTED')
      AND p.total_amount BETWEEN (50000 * 0.90) AND 50000
)
SELECT * FROM ranked_pos 
WHERE rolling_po_count > 1
ORDER BY rolling_vendor_spend DESC;`
    }
  },
  {
    id: 'p2p-vendor-employee-match',
    name: 'Vendor-Employee Match (Ghost Vendor / Conflict of Interest)',
    cycle: 'p2p',
    cycleName: 'Procure-to-Pay (P2P)',
    objective: 'Identify undisclosed conflicts of interest, procurement collusion, and shell vendors.',
    riskDescription: 'Company employees register self-owned businesses as approved suppliers using identical bank IBANs, physical addresses, or tax numbers, funneling company funds without independent bids.',
    primaryTables: ['VENDOR_MASTER', 'EMPLOYEE_PAYROLL', 'AP_PAYMENTS'],
    defaultThreshold: 0,
    thresholdUnit: 'Exact Match',
    thresholdLabel: 'Exact Identifier Cross-Match',
    lookbackDays: 365,
    tolerancePct: 0,
    severity: 'Critical',
    mockExceptions: [
      { id: 'EX-882', timestamp: '2026-10-18 11:20', entity: 'Vendor: Mirage Media (Emp: H. Al-Mansoor)', amount: 215000, detail: 'Vendor bank IBAN exactly matches Senior Procurement Specialist payroll bank account.', riskScore: 99 },
      { id: 'EX-883', timestamp: '2026-10-21 15:40', entity: 'Vendor: BlueWave Cleaning (Emp: R. Patel)', amount: 78000, detail: 'Vendor physical address and phone number identical to Assistant Logistics Manager residential record.', riskScore: 91 },
    ],
    queries: {
      postgres: `-- PostgreSQL Dialect: Cross-match Vendor Master against Employee Payroll
SELECT 
    v.vendor_id,
    v.vendor_name,
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.department,
    CASE 
        WHEN UPPER(REPLACE(v.bank_iban, ' ', '')) = UPPER(REPLACE(e.bank_iban, ' ', '')) THEN 'CRITICAL: MATCHING BANK IBAN'
        WHEN LOWER(TRIM(v.tax_registration_no)) = LOWER(TRIM(e.national_tax_id)) THEN 'HIGH: MATCHING TAX / REGISTRATION ID'
        WHEN LOWER(TRIM(v.address_line1)) = LOWER(TRIM(e.home_address_line1)) THEN 'MEDIUM: MATCHING PHYSICAL ADDRESS'
        ELSE 'OTHER IDENTIFIER MATCH'
    END AS conflict_classification,
    SUM(p.payment_amount) AS total_disbursed_ytd
FROM vendor_master v
JOIN employee_payroll e 
  ON UPPER(REPLACE(v.bank_iban, ' ', '')) = UPPER(REPLACE(e.bank_iban, ' ', ''))
  OR LOWER(TRIM(v.tax_registration_no)) = LOWER(TRIM(e.national_tax_id))
  OR (LOWER(TRIM(v.address_line1)) = LOWER(TRIM(e.home_address_line1)) AND v.address_line1 IS NOT NULL)
LEFT JOIN ap_payments p ON v.vendor_id = p.vendor_id
GROUP BY v.vendor_id, v.vendor_name, e.employee_id, employee_name, e.department, conflict_classification
ORDER BY total_disbursed_ytd DESC NULLS LAST;`,

      snowflake: `-- Snowflake Dialect
SELECT 
    v.vendor_id,
    v.vendor_name,
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.department,
    CASE 
        WHEN REGEXP_REPLACE(v.bank_iban, '[^A-Z0-9]', '') = REGEXP_REPLACE(e.bank_iban, '[^A-Z0-9]', '') THEN 'CRITICAL: MATCHING BANK IBAN'
        WHEN v.tax_registration_no = e.national_tax_id THEN 'HIGH: MATCHING TAX ID'
        ELSE 'MATCHING PHYSICAL RESIDENCE'
    END AS conflict_classification,
    SUM(p.payment_amount) AS total_disbursed_ytd
FROM VENDOR_MASTER v
JOIN EMPLOYEE_PAYROLL e 
  ON REGEXP_REPLACE(v.bank_iban, '[^A-Z0-9]', '') = REGEXP_REPLACE(e.bank_iban, '[^A-Z0-9]', '')
  OR v.tax_registration_no = e.national_tax_id
LEFT JOIN AP_PAYMENTS p ON v.vendor_id = p.vendor_id
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY total_disbursed_ytd DESC NULLS LAST;`,

      bigquery: `-- BigQuery Dialect
SELECT 
    v.vendor_id,
    v.vendor_name,
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    e.department,
    CASE 
        WHEN REGEXP_REPLACE(v.bank_iban, r'[^A-Za-z0-9]', '') = REGEXP_REPLACE(e.bank_iban, r'[^A-Za-z0-9]', '') THEN 'CRITICAL: MATCHING BANK IBAN'
        WHEN v.tax_registration_no = e.national_tax_id THEN 'HIGH: MATCHING TAX ID'
        ELSE 'MATCHING PHYSICAL RESIDENCE'
    END AS conflict_classification,
    SUM(p.payment_amount) AS total_disbursed_ytd
FROM \`enterprise_erp.vendor_master\` v
JOIN \`enterprise_erp.employee_payroll\` e 
  ON REGEXP_REPLACE(v.bank_iban, r'[^A-Za-z0-9]', '') = REGEXP_REPLACE(e.bank_iban, r'[^A-Za-z0-9]', '')
  OR v.tax_registration_no = e.national_tax_id
LEFT JOIN \`enterprise_erp.ap_payments\` p ON v.vendor_id = p.vendor_id
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY total_disbursed_ytd DESC;`,

      oracle: `-- Oracle SQL Dialect
SELECT 
    v.vendor_id,
    v.vendor_name,
    e.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.department,
    CASE 
        WHEN REGEXP_REPLACE(v.bank_iban, '[^A-Za-z0-9]', '') = REGEXP_REPLACE(e.bank_iban, '[^A-Za-z0-9]', '') THEN 'CRITICAL: MATCHING BANK IBAN'
        WHEN v.tax_registration_no = e.national_tax_id THEN 'HIGH: MATCHING TAX ID'
        ELSE 'MATCHING ADDRESS'
    END AS conflict_classification,
    SUM(p.payment_amount) AS total_disbursed_ytd
FROM VENDOR_MASTER v
JOIN EMPLOYEE_PAYROLL e 
  ON REGEXP_REPLACE(v.bank_iban, '[^A-Za-z0-9]', '') = REGEXP_REPLACE(e.bank_iban, '[^A-Za-z0-9]', '')
  OR v.tax_registration_no = e.national_tax_id
LEFT JOIN AP_PAYMENTS p ON v.vendor_id = p.vendor_id
GROUP BY v.vendor_id, v.vendor_name, e.employee_id, e.first_name || ' ' || e.last_name, e.department,
         CASE WHEN REGEXP_REPLACE(v.bank_iban, '[^A-Za-z0-9]', '') = REGEXP_REPLACE(e.bank_iban, '[^A-Za-z0-9]', '') THEN 'CRITICAL: MATCHING BANK IBAN' ELSE 'MATCHING TAX ID' END
ORDER BY total_disbursed_ytd DESC NULLS LAST;`
    }
  },
  {
    id: 'gl-after-hours-mje',
    name: 'After-Hours & Weekend Manual Journal Entries (MJEs)',
    cycle: 'gl',
    cycleName: 'Financial Close & GL (R2R)',
    objective: 'Detect unauthorized general ledger manipulation outside supervised business hours.',
    riskDescription: 'Manual journal entries posted late at night, on weekends, or on public holidays by finance staff without secondary dual-approval, frequently masking financial statement adjustments.',
    primaryTables: ['GL_JE_HEADERS', 'GL_JE_LINES', 'USER_MASTER'],
    defaultThreshold: 25000,
    thresholdUnit: 'AED / USD',
    thresholdLabel: 'Minimum Journal Value',
    lookbackDays: 30,
    tolerancePct: 0,
    severity: 'High',
    mockExceptions: [
      { id: 'EX-714', timestamp: '2026-10-24 02:43 (Sat)', entity: 'User: finance_clerk_03 (Ledger: Main Ops)', amount: 480000, detail: 'Manual debit to Fixed Assets WIP offsetting Accrued OpEx posted Saturday at 2:43 AM.', riskScore: 92 },
      { id: 'EX-715', timestamp: '2026-10-23 23:15 (Fri)', entity: 'User: acct_lead_me (Ledger: Corporate GL)', amount: 125000, detail: 'Post-close revenue accrual manual entry posted late Friday night without secondary sign-off.', riskScore: 84 },
    ],
    queries: {
      postgres: `-- PostgreSQL Dialect: Flag high-value MJEs posted between 10 PM - 5 AM or weekends
SELECT 
    jh.je_header_id,
    jh.je_name,
    jh.posted_date,
    jh.entered_by_user_id,
    u.user_name,
    SUM(jl.entered_dr) AS total_debit_amount,
    EXTRACT(ISODOW FROM jh.posted_date) AS day_of_week, -- 6 = Sat, 7 = Sun
    EXTRACT(HOUR FROM jh.posted_date) AS hour_of_day
FROM gl_je_headers jh
JOIN gl_je_lines jl ON jh.je_header_id = jl.je_header_id
JOIN user_master u ON jh.entered_by_user_id = u.user_id
WHERE jh.je_source = 'Manual' -- Exclude automated subledger feeds (AP, AR, Payroll)
  AND jh.status = 'P'         -- Posted entries
  AND (
      EXTRACT(ISODOW FROM jh.posted_date) IN (6, 7) -- Weekend
      OR EXTRACT(HOUR FROM jh.posted_date) >= 22    -- After 10:00 PM
      OR EXTRACT(HOUR FROM jh.posted_date) < 5      -- Before 5:00 AM
  )
GROUP BY jh.je_header_id, jh.je_name, jh.posted_date, jh.entered_by_user_id, u.user_name
HAVING SUM(jl.entered_dr) >= 25000
ORDER BY total_debit_amount DESC;`,

      snowflake: `-- Snowflake Dialect
SELECT 
    jh.je_header_id,
    jh.je_name,
    jh.posted_date,
    jh.entered_by_user_id,
    u.user_name,
    SUM(jl.entered_dr) AS total_debit_amount,
    DAYOFWEEK(jh.posted_date) AS day_of_week,
    HOUR(jh.posted_date) AS hour_of_day
FROM GL_JE_HEADERS jh
JOIN GL_JE_LINES jl ON jh.je_header_id = jl.je_header_id
JOIN USER_MASTER u ON jh.entered_by_user_id = u.user_id
WHERE jh.je_source = 'Manual'
  AND jh.status = 'P'
  AND (
      DAYOFWEEK(jh.posted_date) IN (0, 6) -- Sunday / Saturday
      OR HOUR(jh.posted_date) >= 22
      OR HOUR(jh.posted_date) < 5
  )
GROUP BY 1, 2, 3, 4, 5, 7, 8
HAVING SUM(jl.entered_dr) >= 25000
ORDER BY total_debit_amount DESC;`,

      bigquery: `-- BigQuery Dialect
SELECT 
    jh.je_header_id,
    jh.je_name,
    jh.posted_date,
    jh.entered_by_user_id,
    u.user_name,
    SUM(jl.entered_dr) AS total_debit_amount,
    EXTRACT(DAYOFWEEK FROM jh.posted_date) AS day_of_week,
    EXTRACT(HOUR FROM jh.posted_date) AS hour_of_day
FROM \`enterprise_erp.gl_je_headers\` jh
JOIN \`enterprise_erp.gl_je_lines\` jl ON jh.je_header_id = jl.je_header_id
JOIN \`enterprise_erp.user_master\` u ON jh.entered_by_user_id = u.user_id
WHERE jh.je_source = 'Manual'
  AND jh.status = 'P'
  AND (
      EXTRACT(DAYOFWEEK FROM jh.posted_date) IN (1, 7)
      OR EXTRACT(HOUR FROM jh.posted_date) >= 22
      OR EXTRACT(HOUR FROM jh.posted_date) < 5
  )
GROUP BY 1, 2, 3, 4, 5, 7, 8
HAVING SUM(jl.entered_dr) >= 25000
ORDER BY total_debit_amount DESC;`,

      oracle: `-- Oracle SQL Dialect
SELECT 
    jh.je_header_id,
    jh.je_name,
    jh.posted_date,
    jh.entered_by_user_id,
    u.user_name,
    SUM(jl.entered_dr) AS total_debit_amount
FROM GL_JE_HEADERS jh
JOIN GL_JE_LINES jl ON jh.je_header_id = jl.je_header_id
JOIN USER_MASTER u ON jh.entered_by_user_id = u.user_id
WHERE jh.je_source = 'Manual'
  AND jh.status = 'P'
  AND (
      TO_CHAR(jh.posted_date, 'DY') IN ('SAT', 'SUN')
      OR TO_NUMBER(TO_CHAR(jh.posted_date, 'HH24')) >= 22
      OR TO_NUMBER(TO_CHAR(jh.posted_date, 'HH24')) < 5
  )
GROUP BY jh.je_header_id, jh.je_name, jh.posted_date, jh.entered_by_user_id, u.user_name
HAVING SUM(jl.entered_dr) >= 25000
ORDER BY total_debit_amount DESC;`
    }
  },
  {
    id: 'o2c-credit-limit-override',
    name: 'Over-Limit Customer Order Release without DOA Sign-Off',
    cycle: 'o2c',
    cycleName: 'Order-to-Cash (O2C)',
    objective: 'Prevent unauthorized credit risk accumulation and bad debt write-offs.',
    riskDescription: 'Commercial sales staff manually force-release blocked orders for delinquent or over-limit customers to meet quarterly sales commission quotas, leaving the enterprise exposed to default.',
    primaryTables: ['SO_HEADERS', 'CUSTOMER_MASTER', 'AR_AGING'],
    defaultThreshold: 100000,
    thresholdUnit: 'AED / USD',
    thresholdLabel: 'Customer Total Overdue Balance',
    lookbackDays: 7,
    tolerancePct: 0,
    severity: 'High',
    mockExceptions: [
      { id: 'EX-604', timestamp: '2026-10-21 17:05', entity: 'Customer: Horizon Trading LLC', amount: 340000, detail: 'Order released with 240,000 balance overdue >90 days and credit cap exceeded by 180%.', riskScore: 90 },
      { id: 'EX-605', timestamp: '2026-10-24 10:15', entity: 'Customer: Al-Noor Contracting', amount: 175000, detail: 'Hold status overridden by Sales Manager without mandatory Credit Committee dual approval.', riskScore: 85 },
    ],
    queries: {
      postgres: `-- PostgreSQL Dialect: Identify sales orders released exceeding credit limit with >90d aging
SELECT 
    so.order_number,
    so.order_date,
    so.order_amount,
    c.customer_id,
    c.customer_name,
    c.credit_limit,
    c.current_balance,
    (c.current_balance + so.order_amount) - c.credit_limit AS excess_exposure,
    so.released_by_user_id,
    so.release_reason
FROM so_headers so
JOIN customer_master c ON so.customer_id = c.customer_id
WHERE so.status IN ('RELEASED', 'APPROVED', 'SHIPPED')
  AND (c.current_balance + so.order_amount) > c.credit_limit
  AND EXISTS (
      -- Check if customer has unpaid overdue invoices > 90 days
      SELECT 1 FROM ar_invoices ar
      WHERE ar.customer_id = c.customer_id
        AND ar.status = 'OPEN'
        AND ar.due_date < CURRENT_DATE - INTERVAL '90 days'
  )
ORDER BY excess_exposure DESC;`,

      snowflake: `-- Snowflake Dialect
SELECT 
    so.order_number,
    so.order_date,
    so.order_amount,
    c.customer_id,
    c.customer_name,
    c.credit_limit,
    c.current_balance,
    (c.current_balance + so.order_amount) - c.credit_limit AS excess_exposure,
    so.released_by_user_id,
    so.release_reason
FROM SO_HEADERS so
JOIN CUSTOMER_MASTER c ON so.customer_id = c.customer_id
WHERE so.status IN ('RELEASED', 'APPROVED', 'SHIPPED')
  AND (c.current_balance + so.order_amount) > c.credit_limit
  AND EXISTS (
      SELECT 1 FROM AR_INVOICES ar
      WHERE ar.customer_id = c.customer_id
        AND ar.status = 'OPEN'
        AND ar.due_date < DATEADD('day', -90, CURRENT_DATE())
  )
ORDER BY excess_exposure DESC;`,

      bigquery: `-- BigQuery Dialect
SELECT 
    so.order_number,
    so.order_date,
    so.order_amount,
    c.customer_id,
    c.customer_name,
    c.credit_limit,
    c.current_balance,
    (c.current_balance + so.order_amount) - c.credit_limit AS excess_exposure,
    so.released_by_user_id,
    so.release_reason
FROM \`enterprise_erp.so_headers\` so
JOIN \`enterprise_erp.customer_master\` c ON so.customer_id = c.customer_id
WHERE so.status IN ('RELEASED', 'APPROVED', 'SHIPPED')
  AND (c.current_balance + so.order_amount) > c.credit_limit
  AND EXISTS (
      SELECT 1 FROM \`enterprise_erp.ar_invoices\` ar
      WHERE ar.customer_id = c.customer_id
        AND ar.status = 'OPEN'
        AND ar.due_date < DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  )
ORDER BY excess_exposure DESC;`,

      oracle: `-- Oracle SQL Dialect
SELECT 
    so.order_number,
    so.order_date,
    so.order_amount,
    c.customer_id,
    c.customer_name,
    c.credit_limit,
    c.current_balance,
    (c.current_balance + so.order_amount) - c.credit_limit AS excess_exposure,
    so.released_by_user_id,
    so.release_reason
FROM SO_HEADERS so
JOIN CUSTOMER_MASTER c ON so.customer_id = c.customer_id
WHERE so.status IN ('RELEASED', 'APPROVED', 'SHIPPED')
  AND (c.current_balance + so.order_amount) > c.credit_limit
  AND EXISTS (
      SELECT 1 FROM AR_INVOICES ar
      WHERE ar.customer_id = c.customer_id
        AND ar.status = 'OPEN'
        AND ar.due_date < SYSDATE - 90
  )
ORDER BY excess_exposure DESC;`
    }
  },
  {
    id: 'payroll-ghost-employee',
    name: 'Ghost Employee / Duplicate Bank Account Cross-Matching',
    cycle: 'payroll',
    cycleName: 'Payroll & HR (H2R)',
    objective: 'Prevent ghost employees and unauthorized payroll diversions.',
    riskDescription: 'Payroll administrators insert fictitious employees into monthly salary disbursement files using active employees or personal bank accounts to siphon monthly compensation.',
    primaryTables: ['EMPLOYEE_MASTER', 'PAYROLL_DISBURSEMENT'],
    defaultThreshold: 0,
    thresholdUnit: 'Duplicate Count',
    thresholdLabel: 'Duplicate Bank Accounts Allowed',
    lookbackDays: 30,
    tolerancePct: 0,
    severity: 'Critical',
    mockExceptions: [
      { id: 'EX-501', timestamp: '2026-10-25 08:00', entity: 'IBAN: AE07033100092831823901', amount: 54000, detail: 'Identical bank account linked to 2 active staff profiles (E-1049 Analyst and E-2081 Field Officer).', riskScore: 96 },
    ],
    queries: {
      postgres: `-- PostgreSQL Dialect: Identify duplicate bank accounts across active employee records
WITH duplicate_ibans AS (
    SELECT 
        UPPER(REPLACE(bank_iban, ' ', '')) AS clean_iban,
        COUNT(DISTINCT employee_id) AS employee_count,
        STRING_AGG(employee_id || ' (' || first_name || ' ' || last_name || ')', ', ') AS linked_employees
    FROM employee_master
    WHERE status = 'ACTIVE'
      AND bank_iban IS NOT NULL
    GROUP BY clean_iban
    HAVING COUNT(DISTINCT employee_id) > 1
)
SELECT 
    d.clean_iban,
    d.employee_count,
    d.linked_employees,
    SUM(p.net_salary) AS total_salary_run_amount
FROM duplicate_ibans d
JOIN employee_master e ON UPPER(REPLACE(e.bank_iban, ' ', '')) = d.clean_iban
JOIN payroll_disbursement p ON e.employee_id = p.employee_id
WHERE p.payroll_period = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
GROUP BY d.clean_iban, d.employee_count, d.linked_employees
ORDER BY total_salary_run_amount DESC;`,

      snowflake: `-- Snowflake Dialect
WITH duplicate_ibans AS (
    SELECT 
        REGEXP_REPLACE(bank_iban, '[^A-Z0-9]', '') AS clean_iban,
        COUNT(DISTINCT employee_id) AS employee_count,
        LISTAGG(employee_id || ' (' || first_name || ' ' || last_name || ')', ', ') AS linked_employees
    FROM EMPLOYEE_MASTER
    WHERE status = 'ACTIVE'
      AND bank_iban IS NOT NULL
    GROUP BY clean_iban
    HAVING COUNT(DISTINCT employee_id) > 1
)
SELECT 
    d.clean_iban,
    d.employee_count,
    d.linked_employees,
    SUM(p.net_salary) AS total_salary_run_amount
FROM duplicate_ibans d
JOIN EMPLOYEE_MASTER e ON REGEXP_REPLACE(e.bank_iban, '[^A-Z0-9]', '') = d.clean_iban
JOIN PAYROLL_DISBURSEMENT p ON e.employee_id = p.employee_id
WHERE p.payroll_period = TO_CHAR(CURRENT_DATE(), 'YYYY-MM')
GROUP BY 1, 2, 3
ORDER BY total_salary_run_amount DESC;`,

      bigquery: `-- BigQuery Dialect
WITH duplicate_ibans AS (
    SELECT 
        REGEXP_REPLACE(bank_iban, r'[^A-Za-z0-9]', '') AS clean_iban,
        COUNT(DISTINCT employee_id) AS employee_count,
        STRING_AGG(CONCAT(employee_id, ' (', first_name, ' ', last_name, ')'), ', ') AS linked_employees
    FROM \`enterprise_erp.employee_master\`
    WHERE status = 'ACTIVE'
      AND bank_iban IS NOT NULL
    GROUP BY clean_iban
    HAVING COUNT(DISTINCT employee_id) > 1
)
SELECT 
    d.clean_iban,
    d.employee_count,
    d.linked_employees,
    SUM(p.net_salary) AS total_salary_run_amount
FROM duplicate_ibans d
JOIN \`enterprise_erp.employee_master\` e ON REGEXP_REPLACE(e.bank_iban, r'[^A-Za-z0-9]', '') = d.clean_iban
JOIN \`enterprise_erp.payroll_disbursement\` p ON e.employee_id = p.employee_id
WHERE p.payroll_period = FORMAT_DATE('%Y-%m', CURRENT_DATE())
GROUP BY 1, 2, 3
ORDER BY total_salary_run_amount DESC;`,

      oracle: `-- Oracle SQL Dialect
WITH duplicate_ibans AS (
    SELECT 
        REGEXP_REPLACE(bank_iban, '[^A-Za-z0-9]', '') AS clean_iban,
        COUNT(DISTINCT employee_id) AS employee_count,
        LISTAGG(employee_id || ' (' || first_name || ' ' || last_name || ')', ', ') 
            WITHIN GROUP (ORDER BY employee_id) AS linked_employees
    FROM EMPLOYEE_MASTER
    WHERE status = 'ACTIVE'
      AND bank_iban IS NOT NULL
    GROUP BY REGEXP_REPLACE(bank_iban, '[^A-Za-z0-9]', '')
    HAVING COUNT(DISTINCT employee_id) > 1
)
SELECT 
    d.clean_iban,
    d.employee_count,
    d.linked_employees,
    SUM(p.net_salary) AS total_salary_run_amount
FROM duplicate_ibans d
JOIN EMPLOYEE_MASTER e ON REGEXP_REPLACE(e.bank_iban, '[^A-Za-z0-9]', '') = d.clean_iban
JOIN PAYROLL_DISBURSEMENT p ON e.employee_id = p.employee_id
WHERE p.payroll_period = TO_CHAR(SYSDATE, 'YYYY-MM')
GROUP BY d.clean_iban, d.employee_count, d.linked_employees
ORDER BY total_salary_run_amount DESC;`
    }
  }
];

export default function CcmTelemetryArchitect() {
  const [selectedCycle, setSelectedCycle] = useState<BusinessCycle>('p2p');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('p2p-split-po');
  const [activeDialect, setActiveDialect] = useState<SqlDialect>('postgres');
  const [copied, setCopied] = useState<boolean>(false);

  // Calibration parameters
  const [thresholdAmount, setThresholdAmount] = useState<number>(50000);
  const [lookbackWindowDays, setLookbackWindowDays] = useState<number>(3);
  const [proximityTolerancePct, setProximityTolerancePct] = useState<number>(10);

  // Active rule reference
  const currentRule = useMemo(() => {
    return RULES.find(r => r.id === selectedRuleId) || RULES[0];
  }, [selectedRuleId]);

  // When cycle changes, select first rule in that cycle
  const handleCycleChange = (cycle: BusinessCycle) => {
    setSelectedCycle(cycle);
    const firstRuleInCycle = RULES.find(r => r.cycle === cycle);
    if (firstRuleInCycle) {
      setSelectedRuleId(firstRuleInCycle.id);
      setThresholdAmount(firstRuleInCycle.defaultThreshold);
      setLookbackWindowDays(firstRuleInCycle.lookbackDays);
      setProximityTolerancePct(firstRuleInCycle.tolerancePct);
    }
  };

  // Select rule
  const handleRuleSelect = (rule: CcmRule) => {
    setSelectedRuleId(rule.id);
    setSelectedCycle(rule.cycle);
    setThresholdAmount(rule.defaultThreshold);
    setLookbackWindowDays(rule.lookbackDays);
    setProximityTolerancePct(rule.tolerancePct);
  };

  // Copy SQL to clipboard
  const handleCopySql = () => {
    const code = currentRule.queries[activeDialect];
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset to default calibration
  const handleResetCalibration = () => {
    setThresholdAmount(currentRule.defaultThreshold);
    setLookbackWindowDays(currentRule.lookbackDays);
    setProximityTolerancePct(currentRule.tolerancePct);
  };

  // Export Specification Sheet to CSV
  const handleExportSpec = () => {
    const headers = [
      'Control Specification Field',
      'Parameter Value',
      'Technical / Audit Guidance'
    ];

    const rows = [
      ['Control Telemetry Rule', currentRule.name, 'Automated continuous exception logic'],
      ['Business Process Cycle', currentRule.cycleName, 'Enterprise operating cycle'],
      ['Audit Objective', currentRule.objective, 'Internal audit standard testing goal'],
      ['Underlying Risk Exposure', currentRule.riskDescription, 'Fraud or control breakdown vector'],
      ['Primary Source Tables', currentRule.primaryTables.join(', '), 'ERP tables monitored in data warehouse'],
      ['DOA / Value Threshold', `${thresholdAmount.toLocaleString()} ${currentRule.thresholdUnit}`, 'Boundary trigger amount'],
      ['Lookback Window', `${lookbackWindowDays} Days`, 'Rolling temporal evaluation horizon'],
      ['Proximity Tolerance', `${proximityTolerancePct}%`, 'Sensitivity band below authorization cap'],
      ['Severity Classification', currentRule.severity, 'Escalation hierarchy rating'],
      ['Active SQL Dialect', activeDialect.toUpperCase(), 'Target data warehouse engine'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `CCM_Telemetry_Spec_${currentRule.id}_${activeDialect}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Value Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Audit Population</span>
            <Database className="h-4 w-4 text-[#c7964c]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
            100%
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#107c41]">
            Replaces 25-sample testing
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Latency</span>
            <Clock className="h-4 w-4 text-[#107c41]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#107c41]">
            Daily / Real-Time
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            Continuous telemetry stream
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Supported Engines</span>
            <Code2 className="h-4 w-4 text-[#8d6035]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#181511] dark:text-white">
            4 Dialects
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            Snowflake, BigQuery, Postgres, Oracle
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/60 p-4 backdrop-blur-sm dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
            <span>Simulated Leakage</span>
            <DollarSign className="h-4 w-4 text-[#d9381e]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#d9381e]">
            AED 1.15M
          </div>
          <div className="mt-1 text-[11px] font-medium text-[color:var(--text-secondary)]">
            Detected in 10k ledger test
          </div>
        </div>
      </div>

      {/* Cycle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--line-soft)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'p2p', label: 'Procure-to-Pay (P2P)', count: 2 },
            { id: 'o2c', label: 'Order-to-Cash (O2C)', count: 1 },
            { id: 'gl', label: 'Financial Close & GL', count: 1 },
            { id: 'payroll', label: 'Payroll & HR', count: 1 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleCycleChange(tab.id as BusinessCycle)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCycle === tab.id
                  ? 'bg-[#181511] text-white shadow-md dark:bg-white dark:text-[#181511]'
                  : 'bg-white/70 text-[color:var(--text-secondary)] hover:bg-white hover:text-[#181511] dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-[#c7964c]/20 px-2 py-0.5 text-[10px] text-[#c7964c]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleExportSpec}
          className="flex items-center gap-2 rounded-xl border border-[color:var(--line-soft)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#181511] shadow-sm transition hover:bg-white dark:bg-white/10 dark:text-white"
        >
          <Download className="h-3.5 w-3.5 text-[#c7964c]" />
          <span>Export Control Spec (CSV)</span>
        </button>
      </div>

      {/* Main Grid: Rules Left, Telemetry & SQL Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Rule Selection */}
        <div className="space-y-4 lg:col-span-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#181511] dark:text-white">
            Configured Exception Rules
          </h3>

          <div className="space-y-2.5">
            {RULES.filter(r => r.cycle === selectedCycle).map(rule => {
              const isSelected = rule.id === selectedRuleId;

              return (
                <div
                  key={rule.id}
                  onClick={() => handleRuleSelect(rule)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-[#c7964c] bg-white shadow-md ring-2 ring-[#c7964c]/20 dark:bg-white/10'
                      : 'border-[color:var(--line-soft)] bg-white/50 hover:border-slate-400 hover:bg-white dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs leading-snug text-[#181511] dark:text-white">
                      {rule.name}
                    </h4>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      rule.severity === 'Critical'
                        ? 'bg-[#d9381e]/15 text-[#d9381e]'
                        : 'bg-[#c7964c]/15 text-[#a66c1c] dark:text-[#f4c98b]'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--text-secondary)] line-clamp-2">
                    {rule.objective}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-[color:var(--line-soft)] pt-2 text-[10px] text-[color:var(--text-secondary)]">
                    <span>Tables: {rule.primaryTables.slice(0, 2).join(', ')}</span>
                    <span className="font-semibold text-[#c7964c] flex items-center gap-1">
                      Configure &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rule Metadata & Calibration Box */}
          <div className="rounded-3xl border border-[color:var(--line-soft)] bg-white/70 p-5 shadow-sm dark:bg-white/5">
            <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#181511] dark:text-white">
                Threshold Calibration
              </span>
              <button
                onClick={handleResetCalibration}
                className="text-[10px] font-semibold text-[color:var(--text-secondary)] hover:text-[#d9381e]"
                title="Reset to default thresholds"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {currentRule.defaultThreshold > 0 && (
                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-[color:var(--text-secondary)]">{currentRule.thresholdLabel}:</span>
                    <span className="font-mono text-[#181511] dark:text-white">
                      {thresholdAmount.toLocaleString()} {currentRule.thresholdUnit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={250000}
                    step={5000}
                    value={thresholdAmount}
                    onChange={e => setThresholdAmount(parseInt(e.target.value))}
                    className="mt-2 w-full accent-[#c7964c]"
                  />
                </div>
              )}

              {currentRule.lookbackDays > 0 && (
                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-[color:var(--text-secondary)]">Rolling Lookback Window:</span>
                    <span className="font-mono text-[#181511] dark:text-white">
                      {lookbackWindowDays} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    step={1}
                    value={lookbackWindowDays}
                    onChange={e => setLookbackWindowDays(parseInt(e.target.value))}
                    className="mt-2 w-full accent-[#c7964c]"
                  />
                </div>
              )}

              {currentRule.tolerancePct > 0 && (
                <div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-[color:var(--text-secondary)]">Proximity Delta Below Cap:</span>
                    <span className="font-mono text-[#181511] dark:text-white">
                      Within {proximityTolerancePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    step={1}
                    value={proximityTolerancePct}
                    onChange={e => setProximityTolerancePct(parseInt(e.target.value))}
                    className="mt-2 w-full accent-[#c7964c]"
                  />
                </div>
              )}
            </div>

            {/* The Parallax Sensitivity Warning */}
            <div className="mt-5 rounded-2xl bg-[#c7964c]/10 p-3 text-[11px] leading-relaxed text-[#8d6035] dark:text-[#f4c98b]">
              <strong>False Positive Sensitivity:</strong> Tightening thresholds to &lt;2% captures sophisticated evasion but generates 40+ routine operational alerts daily, leading frontline finance teams to rubber-stamp sign-offs.
            </div>
          </div>
        </div>

        {/* Right Column: Rule Details, Exceptions, & Multi-Dialect SQL */}
        <div className="space-y-6 lg:col-span-8">
          {/* Header Description */}
          <div className="rounded-3xl border border-[color:var(--line-soft)] bg-white/70 p-6 shadow-sm backdrop-blur-md dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="rounded-full bg-[#181511] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#f4c98b] dark:bg-white/10 dark:text-[#f4c98b]">
                  {currentRule.cycleName}
                </span>
                <h3 className="mt-2 text-xl font-black text-[#181511] dark:text-white">
                  {currentRule.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="meta-label">Primary Sources</span>
                <div className="mt-1 flex flex-wrap gap-1 justify-end">
                  {currentRule.primaryTables.map(t => (
                    <span key={t} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700 dark:bg-white/10 dark:text-white">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[color:var(--text-secondary)]">
              {currentRule.riskDescription}
            </p>

            {/* Simulated Exception Hits */}
            <div className="mt-6 border-t border-[color:var(--line-soft)] pt-5">
              <div className="flex items-center justify-between pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181511] dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#d9381e]" />
                  <span>Simulated Population Exceptions ({currentRule.mockExceptions.length} Detected)</span>
                </h4>
                <span className="text-[11px] font-semibold text-[#107c41]">
                  100% Population Scan Active
                </span>
              </div>

              <div className="space-y-2">
                {currentRule.mockExceptions.map(exc => (
                  <div
                    key={exc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[color:var(--line-soft)] bg-white p-3.5 shadow-sm text-xs dark:bg-white/5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#d9381e]">{exc.id}</span>
                        <span className="font-semibold text-[#181511] dark:text-white">{exc.entity}</span>
                        <span className="text-[10px] text-[color:var(--text-secondary)]">({exc.timestamp})</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[color:var(--text-secondary)]">
                        {exc.detail}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-sm text-[#181511] dark:text-white">
                        {exc.amount > 0 ? `AED ${exc.amount.toLocaleString()}` : 'Exact Match'}
                      </div>
                      <div className="text-[10px] font-bold text-[#d9381e]">
                        Anomaly Score: {exc.riskScore}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SQL Code Generator Block */}
          <div className="rounded-3xl border border-[color:var(--line-soft)] bg-[#181512] p-6 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#f4c98b]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Executable Telemetry Query
                </span>
              </div>

              {/* Dialect Switcher */}
              <div className="flex items-center gap-1.5 rounded-xl bg-white/5 p-1">
                {(['postgres', 'snowflake', 'bigquery', 'oracle'] as SqlDialect[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDialect(d)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeDialect === d
                        ? 'bg-[#c7964c] text-black shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {d === 'postgres' ? 'Postgres / DuckDB' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Display Area */}
            <div className="relative mt-4">
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#107c41]" />
                    <span className="text-[#107c41]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>

              <pre className="max-h-[380px] overflow-x-auto rounded-2xl bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-[#f4c98b]/90">
                <code>{currentRule.queries[activeDialect]}</code>
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-3">
              <span>Ready for execution in cron jobs, dbt models, or automated BI triggers.</span>
              <span className="font-mono text-white/70">Dialect: {activeDialect.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
