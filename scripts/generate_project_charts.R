
# ── Portfolio Project Charts ─────────────────────────────────────────────────
# Grammar of Graphics (ggplot2) charts for 10 text-heavy projects
# 2 charts per project = 20 charts total
# Run from: C:/Users/sorat/Desktop/Coding/portfolio_my/
# ────────────────────────────────────────────────────────────────────────────

library(ggplot2)
library(dplyr)
library(tidyr)
library(scales)

# ── Design tokens ─────────────────────────────────────────────────────────────
NAVY   <- "#001F5B"
GOLD   <- "#C9A84C"
SLATE  <- "#475569"
LIGHT  <- "#94a3b8"
RED    <- "#dc2626"
AMBER  <- "#d97706"
GREEN  <- "#16a34a"
ORANGE <- "#ea580c"
BLUE   <- "#0369a1"
TEAL   <- "#0f766e"
PURPLE <- "#7c3aed"

BASE <- "C:/Users/sorat/Desktop/Coding/portfolio_my/public/images/projects"

# ── Shared theme ──────────────────────────────────────────────────────────────
pt <- function(legend_pos = "none") {
  theme_minimal(base_size = 11) +
    theme(
      plot.background   = element_rect(fill = "white", colour = NA),
      panel.background  = element_rect(fill = "white", colour = NA),
      panel.grid.major  = element_line(colour = "#f1f5f9", linewidth = 0.5),
      panel.grid.minor  = element_blank(),
      panel.grid.major.y = element_line(colour = "#f1f5f9", linewidth = 0.4),
      axis.text         = element_text(colour = SLATE, size = 9),
      axis.title        = element_text(colour = SLATE, size = 9, face = "bold"),
      axis.ticks        = element_blank(),
      plot.title        = element_text(colour = NAVY,  size = 13, face = "bold",
                                       margin = margin(b = 4)),
      plot.subtitle     = element_text(colour = LIGHT, size = 8.5,
                                       margin = margin(b = 10)),
      plot.caption      = element_text(colour = LIGHT, size = 7.5,
                                       margin = margin(t = 10), hjust = 0),
      legend.position   = legend_pos,
      legend.text       = element_text(colour = SLATE, size = 8.5),
      legend.title      = element_text(colour = SLATE, size = 9, face = "bold"),
      legend.key.size   = unit(0.9, "lines"),
      plot.margin       = margin(18, 22, 14, 18)
    )
}

save_chart <- function(p, folder, filename, w = 8, h = 5) {
  out <- file.path(BASE, folder, filename)
  ggsave(out, plot = p, width = w, height = h, dpi = 150, bg = "white")
  message("  saved: ", folder, "/", filename)
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. ML-POWERED FRAUD DETECTION  (fraud-detection)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 1. ML Fraud Detection ──")

# 1a. Model Performance by Risk Band
df_model <- data.frame(
  metric = rep(c("Precision", "Recall", "F1 Score"), each = 4),
  band   = rep(c("No Fraud", "Low Risk", "High Risk", "Confirmed"), 3),
  value  = c(0.96, 0.89, 0.85, 0.91,
             0.97, 0.82, 0.88, 0.86,
             0.96, 0.85, 0.87, 0.88)
)
df_model$band <- factor(df_model$band,
                        levels = c("No Fraud", "Low Risk", "High Risk", "Confirmed"))
df_model$metric <- factor(df_model$metric,
                          levels = c("Precision", "Recall", "F1 Score"))

p1a <- ggplot(df_model, aes(x = band, y = value, fill = metric)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(round(value * 100), "%")),
            position = position_dodge(width = 0.7),
            vjust = -0.5, size = 2.8, colour = SLATE, fontface = "bold") +
  scale_fill_manual(values = c(NAVY, GOLD, TEAL)) +
  scale_y_continuous(labels = percent_format(), limits = c(0, 1.08),
                     breaks = seq(0, 1, 0.25)) +
  labs(title    = "ML Model Performance by Risk Classification Band",
       subtitle = "Isolation Forest model — 87.3% overall accuracy across 2.3M monthly transactions",
       x = NULL, y = NULL, fill = NULL,
       caption  = "Fraud Detection ML · Model Validation Results") +
  pt("top")

save_chart(p1a, "fraud-detection", "model-performance.png")

# 1b. Flagged vs Confirmed Fraud by Transaction Category
df_detect <- data.frame(
  category  = c("Vendor Payments", "Employee Expenses",
                "Petty Cash & Advances", "Refunds & Credits", "Payroll Anomalies"),
  flagged   = c(127, 43, 31, 61, 14),
  confirmed = c(89, 31, 22, 44, 9)
)
df_detect <- df_detect |> mutate(category = reorder(category, flagged))

p1b <- ggplot(df_detect) +
  geom_col(aes(y = category, x = flagged),
           fill = paste0(NAVY, "22"), width = 0.55) +
  geom_col(aes(y = category, x = confirmed),
           fill = NAVY, width = 0.35) +
  geom_text(aes(y = category, x = confirmed, label = confirmed),
            hjust = -0.4, size = 3, colour = NAVY, fontface = "bold") +
  scale_x_continuous(expand = expansion(mult = c(0, 0.12))) +
  labs(title    = "Fraud Flags and Confirmed Cases by Transaction Type",
       subtitle = "Dark bar = confirmed fraud  |  Light bar = flagged for review",
       x = "Transaction Count", y = NULL,
       caption  = "Fraud Detection ML · Alert Analysis — AED 3.2M recurring annual recovery identified") +
  pt()

save_chart(p1b, "fraud-detection", "detection-by-category.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 2. AUDIT FINDINGS MANAGEMENT SYSTEM  (audit-tools)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 2. Audit Findings System ──")

# 2a. Findings by Severity — Quarterly Trend
df_sev <- data.frame(
  quarter  = rep(c("Q1", "Q2", "Q3", "Q4"), each = 4),
  severity = rep(c("Critical", "High", "Medium", "Low"), 4),
  count    = c(4, 9, 15, 22,   # Q1
               2, 7, 17, 25,   # Q2
               1, 5, 13, 29,   # Q3
               1, 4, 11, 33)   # Q4
)
df_sev$severity <- factor(df_sev$severity,
                          levels = c("Critical", "High", "Medium", "Low"))

p2a <- ggplot(df_sev, aes(x = quarter, y = count, fill = severity)) +
  geom_col(position = "stack", width = 0.6) +
  scale_fill_manual(values = c(RED, ORANGE, AMBER, GREEN),
                    guide  = guide_legend(reverse = TRUE)) +
  labs(title    = "Audit Findings by Severity — Quarterly Distribution",
       subtitle = "Composition shift confirms improving control environment across the engagement year",
       x = NULL, y = "Number of Findings", fill = "Severity",
       caption  = "Audit Findings Management System · IIA-aligned severity framework") +
  pt("right")

save_chart(p2a, "audit-tools", "findings-by-severity.png")

# 2b. Average Days to Resolution vs 45-Day Target
df_res <- data.frame(
  category = c("Financial Controls", "IT / ITGC", "Compliance",
                "Operational", "Fraud Risk"),
  avg_days = c(38, 53, 27, 44, 62)
)
df_res <- df_res |> mutate(category = reorder(category, avg_days),
                            colour   = ifelse(avg_days > 45, RED, NAVY))

p2b <- ggplot(df_res, aes(y = category, x = avg_days, colour = colour)) +
  geom_segment(aes(y = category, yend = category, x = 0, xend = avg_days),
               linewidth = 1.3) +
  geom_point(size = 5) +
  geom_vline(xintercept = 45, linetype = "dashed", colour = GOLD, linewidth = 0.9) +
  geom_text(aes(label = paste0(avg_days, "d")),
            hjust = -0.6, size = 3, fontface = "bold") +
  annotate("text", x = 47, y = 0.6, label = "45-day target",
           colour = GOLD, size = 2.9, hjust = 0, fontface = "bold") +
  scale_colour_identity() +
  scale_x_continuous(expand = expansion(mult = c(0, 0.18)), limits = c(0, NA)) +
  labs(title    = "Average Days to Resolution by Audit Finding Category",
       subtitle = "Red dots exceed the 45-day remediation target — prioritised for management escalation",
       x = "Calendar Days to Close", y = NULL,
       caption  = "Audit Findings Management System · Remediation Tracking") +
  pt()

save_chart(p2b, "audit-tools", "resolution-timeline.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 3. EXECUTIVE FINANCIAL DASHBOARD  (finance-dashboard)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 3. Executive Financial Dashboard ──")

# 3a. Actual vs Budget Variance by Quarter
df_var <- data.frame(
  quarter  = rep(c("Q1", "Q2", "Q3", "Q4"), each = 2),
  type     = rep(c("Actual", "Budget"), 4),
  revenue  = c(29.4, 31.0,  31.8, 32.5,  34.2, 33.0,  32.7, 30.5)
)
df_var$type <- factor(df_var$type, levels = c("Budget", "Actual"))

p3a <- ggplot(df_var, aes(x = quarter, y = revenue, fill = type)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0("AED ", revenue, "M")),
            position = position_dodge(width = 0.7),
            vjust = -0.5, size = 2.8, colour = SLATE, fontface = "bold") +
  scale_fill_manual(values = c(paste0(NAVY, "40"), NAVY)) +
  scale_y_continuous(labels = label_dollar(prefix = "AED ", suffix = "M"),
                     limits = c(0, 40), breaks = seq(0, 40, 10)) +
  labs(title    = "Revenue — Actual vs Budget by Quarter",
       subtitle = "Q3 achieved AED 34.2M, exceeding budget by AED 1.2M (+3.6%)",
       x = NULL, y = NULL, fill = NULL,
       caption  = "Executive Financial Dashboard · AED 127M total group revenue tracked") +
  pt("top")

save_chart(p3a, "finance-dashboard", "variance-analysis.png")

# 3b. KPI Performance vs Target
df_kpi <- data.frame(
  kpi     = c("Revenue (AEDm)", "EBITDA Margin", "Cost Ratio",
               "Working Capital Days", "Recovery Rate", "Budget Adherence"),
  target  = c(100, 40, 60, 45, 85, 95),
  actual  = c(127, 37.5, 58, 38, 91, 88)
)
df_kpi <- df_kpi |>
  mutate(kpi    = reorder(kpi, actual),
         on_tgt = ifelse(actual >= target, GREEN, ORANGE),
         gap    = actual - target)

p3b <- ggplot(df_kpi) +
  geom_segment(aes(y = kpi, yend = kpi, x = target, xend = actual,
                   colour = on_tgt), linewidth = 1.4) +
  geom_point(aes(y = kpi, x = target), colour = LIGHT, size = 3.5) +
  geom_point(aes(y = kpi, x = actual, colour = on_tgt), size = 4.5) +
  geom_text(aes(y = kpi, x = actual,
                label = paste0(actual, ifelse(kpi == "Revenue (AEDm)", "M", "%"))),
            hjust = -0.5, size = 2.9, fontface = "bold", colour = SLATE) +
  scale_colour_identity() +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.18))) +
  labs(title    = "KPI Performance vs Target — Full Year",
       subtitle = "Green = on/above target  |  Orange = below target  |  Grey dot = target",
       x = "Score / Value", y = NULL,
       caption  = "Executive Financial Dashboard · Board KPI Pack") +
  pt()

save_chart(p3b, "finance-dashboard", "kpi-performance.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 4. TADAWUL IPO READINESS  (tadawul-ipo-readiness)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 4. Tadawul IPO Readiness ──")

# 4a. IPO Readiness Scorecard — Baseline vs Listing-Ready
df_ready <- data.frame(
  workstream = c("ICOFR Framework", "Corporate Governance",
                 "IFRS Financial Statements", "Internal Audit Function",
                 "Risk Management (ERM)", "CMA Regulatory Compliance",
                 "Disclosure & Investor Relations"),
  baseline  = c(10, 15, 30, 5, 20, 25, 10),
  current   = c(95, 90, 100, 85, 80, 92, 75)
)
df_ready$workstream <- factor(df_ready$workstream,
                              levels = df_ready$workstream[order(df_ready$current)])

df_ready_long <- df_ready |>
  pivot_longer(c(baseline, current), names_to = "stage", values_to = "pct") |>
  mutate(stage = recode(stage, baseline = "Pre-Engagement", current = "Listing-Ready"))
df_ready_long$stage <- factor(df_ready_long$stage,
                              levels = c("Pre-Engagement", "Listing-Ready"))

p4a <- ggplot(df_ready_long, aes(y = workstream, x = pct, fill = stage)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(pct, "%")),
            position = position_dodge(width = 0.7),
            hjust = -0.2, size = 2.8, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(paste0(NAVY, "35"), NAVY)) +
  scale_x_continuous(labels = percent_format(scale = 1),
                     limits = c(0, 115), breaks = seq(0, 100, 25)) +
  labs(title    = "IPO Readiness Scorecard — Pre-Engagement vs Listing-Ready",
       subtitle = "24-month programme targeting Tadawul listing for GCC premium brand (SAR 500M+ raise)",
       x = "Readiness %", y = NULL, fill = NULL,
       caption  = "Tadawul IPO Readiness · COSO ICOFR · CMA Regulations · IFRS") +
  pt("top")

save_chart(p4a, "tadawul-ipo-readiness", "readiness-scorecard.png", w = 9, h = 5.5)

# 4b. ICOFR Control Population by Business Process
df_ctrl <- data.frame(
  process = c("Financial Close &\nReporting", "Revenue &\nReceivables",
               "Procure to Pay", "Payroll &\nHR", "Treasury &\nCash",
               "Inventory &\nAssets", "IT General\nControls",
               "Tax &\nCompliance", "Capex", "Entity Level\nControls",
               "Governance\n& Board", "Related Party\nTransactions",
               "Disclosure &\nIR", "Regulatory\nCompliance"),
  controls = c(28, 22, 19, 16, 14, 12, 18, 11, 9, 15, 8, 7, 6, 5)
)
df_ctrl$process <- reorder(df_ctrl$process, df_ctrl$controls)

p4b <- ggplot(df_ctrl, aes(y = process, x = controls)) +
  geom_col(fill = NAVY, width = 0.65) +
  geom_text(aes(label = controls), hjust = -0.3,
            size = 3, colour = NAVY, fontface = "bold") +
  scale_x_continuous(expand = expansion(mult = c(0, 0.12))) +
  labs(title    = "ICOFR Control Population by Business Process",
       subtitle = "190 controls documented across 14 processes — Risk Control Matrices aligned to COSO assertions",
       x = "Number of Controls", y = NULL,
       caption  = "Tadawul IPO Readiness · ICOFR Programme · Design & Operating Effectiveness Tested") +
  pt()

save_chart(p4b, "tadawul-ipo-readiness", "control-population.png", w = 8.5, h = 6)

# ═══════════════════════════════════════════════════════════════════════════════
# 5. ENTERPRISE AUDIT MANAGEMENT PLATFORM  (enterprise-audit-tracker)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 5. Enterprise Audit Platform ──")

# 5a. Annual Audit Plan Status by Business Entity
df_plan <- data.frame(
  entity  = rep(c("Holding Co.", "Retail Div.", "Real Estate", "F&B Operations",
                  "Technology", "HR & Shared Svcs"), each = 3),
  status  = rep(c("Completed", "In Progress", "Planned"), 6),
  audits  = c(8,1,1,  6,2,2,  5,1,2,  7,1,2,  4,2,1,  3,1,2)
)
df_plan$status <- factor(df_plan$status,
                         levels = c("Planned", "In Progress", "Completed"))
df_plan$entity <- factor(df_plan$entity,
  levels = c("HR & Shared Svcs","Technology","Real Estate",
             "F&B Operations","Retail Div.","Holding Co."))

p5a <- ggplot(df_plan, aes(y = entity, x = audits, fill = status)) +
  geom_col(position = "stack", width = 0.6) +
  scale_fill_manual(values = c(paste0(NAVY, "25"), GOLD, GREEN)) +
  labs(title    = "Annual Audit Plan — Status by Business Entity",
       subtitle = "Risk-based audit plan: highest-risk entities scheduled first across the group",
       x = "Number of Audits", y = NULL, fill = "Status",
       caption  = "Enterprise Audit Management Platform · 3-Tier Governance Reporting") +
  pt("top")

save_chart(p5a, "enterprise-audit-tracker", "audit-plan-status.png")

# 5b. Open Findings by Age Profile
df_age <- data.frame(
  age_band = c("0–14 days", "15–30 days", "31–45 days", "46–60 days",
               "61–90 days", "90+ days (Escalated)"),
  findings = c(12, 18, 9, 7, 5, 4),
  overdue  = c(FALSE, FALSE, FALSE, TRUE, TRUE, TRUE)
)
df_age$age_band <- factor(df_age$age_band, levels = df_age$age_band)

p5b <- ggplot(df_age, aes(x = age_band, y = findings,
                           fill = overdue)) +
  geom_col(width = 0.65) +
  geom_text(aes(label = findings), vjust = -0.4,
            size = 3, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(NAVY, RED),
                    labels = c("Within target", "Overdue — escalated")) +
  labs(title    = "Open Audit Findings — Age Profile",
       subtitle = "Findings exceeding 45-day target escalated automatically to senior management",
       x = NULL, y = "Open Findings", fill = NULL,
       caption  = "Enterprise Audit Management Platform · Real-Time Remediation Tracker") +
  pt("top")

save_chart(p5b, "enterprise-audit-tracker", "finding-age-profile.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 6. FOOD SAFETY RISK ASSESSMENT  (food-safety-risk)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 6. Food Safety Risk ──")

# 6a. Composite Risk Score by Location Cluster
set.seed(42)
df_loc <- data.frame(
  cluster   = paste0("Cluster ", LETTERS[1:12]),
  risk_score = c(72, 58, 81, 44, 66, 90, 53, 77, 38, 62, 85, 49),
  locations  = c(8, 6, 9, 5, 7, 10, 6, 8, 4, 7, 9, 5)
)
df_loc <- df_loc |>
  mutate(cluster   = reorder(cluster, risk_score),
         risk_band = case_when(
           risk_score >= 75 ~ "High",
           risk_score >= 55 ~ "Medium",
           TRUE             ~ "Low"),
         bar_col   = case_when(
           risk_score >= 75 ~ RED,
           risk_score >= 55 ~ AMBER,
           TRUE             ~ GREEN))

p6a <- ggplot(df_loc) +
  geom_segment(aes(y = cluster, yend = cluster, x = 0, xend = risk_score,
                   colour = bar_col), linewidth = 1.4) +
  geom_point(aes(y = cluster, x = risk_score, colour = bar_col), size = 4.5) +
  geom_text(aes(y = cluster, x = risk_score, label = risk_score),
            hjust = -0.5, size = 2.9, fontface = "bold", colour = SLATE) +
  geom_vline(xintercept = 55, linetype = "dashed", colour = AMBER, linewidth = 0.7) +
  geom_vline(xintercept = 75, linetype = "dashed", colour = RED,   linewidth = 0.7) +
  scale_colour_identity() +
  scale_x_continuous(limits = c(0, 105), expand = expansion(mult = c(0, 0.02))) +
  labs(title    = "Composite Food Safety Risk Score by Location Cluster",
       subtitle = "Clusters scoring 75+ require immediate remediation action | 70+ locations assessed",
       x = "Composite Risk Score (0–100)", y = NULL,
       caption  = "Food Safety Risk Assessment Framework · 70+ Restaurant Locations") +
  pt()

save_chart(p6a, "food-safety-risk", "risk-by-cluster.png")

# 6b. Control Compliance Rate by Category
df_ctrl_fs <- data.frame(
  category    = c("Temperature Controls", "HACCP Documentation",
                  "Personal Hygiene", "Storage & Handling",
                  "Cleaning & Sanitation", "Supplier Verification",
                  "Pest Control", "Allergen Management"),
  compliance  = c(91, 74, 88, 79, 83, 67, 85, 71)
)
df_ctrl_fs <- df_ctrl_fs |>
  mutate(category   = reorder(category, compliance),
         bar_col    = ifelse(compliance >= 80, NAVY, ORANGE))

p6b <- ggplot(df_ctrl_fs, aes(y = category, x = compliance, fill = bar_col)) +
  geom_col(width = 0.65) +
  geom_text(aes(label = paste0(compliance, "%")),
            hjust = -0.3, size = 3, fontface = "bold", colour = SLATE) +
  geom_vline(xintercept = 80, linetype = "dashed", colour = GOLD, linewidth = 0.8) +
  annotate("text", x = 82, y = 0.6, label = "80% minimum standard",
           colour = GOLD, size = 2.8, hjust = 0, fontface = "bold") +
  scale_fill_identity() +
  scale_x_continuous(labels = percent_format(scale = 1),
                     limits = c(0, 108), breaks = seq(0, 100, 20)) +
  labs(title    = "Control Compliance Rate by Food Safety Category",
       subtitle = "Orange bars fall below 80% minimum — prioritised for corrective action and re-audit",
       x = "Compliance Rate", y = NULL,
       caption  = "Food Safety Risk Assessment Framework · Control Validation Results") +
  pt()

save_chart(p6b, "food-safety-risk", "control-compliance.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 7. FORENSIC FRAUD INVESTIGATION TOOLKIT  (fraud-cases)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 7. Forensic Fraud Toolkit ──")

# 7a. Financial Exposure by Fraud Scheme Type
df_scheme <- data.frame(
  scheme     = c("Ghost Vendor Payments", "Employee Expense Manipulation",
                 "Inventory Diversion", "Payroll Ghost Employees",
                 "Management Override", "Procurement Kickbacks"),
  exposed    = c(4.8, 1.2, 2.3, 0.9, 3.1, 1.7),
  recovered  = c(3.6, 0.9, 1.4, 0.7, 1.8, 1.1)
)
df_scheme <- df_scheme |>
  mutate(scheme = reorder(scheme, exposed))

df_scheme_long <- df_scheme |>
  pivot_longer(c(exposed, recovered), names_to = "type", values_to = "aed_m") |>
  mutate(type = recode(type, exposed = "Total Exposed", recovered = "Recovered / Traced"))
df_scheme_long$type <- factor(df_scheme_long$type,
                              levels = c("Total Exposed", "Recovered / Traced"))

p7a <- ggplot(df_scheme_long, aes(y = scheme, x = aed_m, fill = type)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0("AED ", aed_m, "M")),
            position = position_dodge(width = 0.7),
            hjust = -0.15, size = 2.8, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(paste0(RED, "55"), NAVY)) +
  scale_x_continuous(labels = label_dollar(prefix = "AED ", suffix = "M"),
                     limits = c(0, 6.5)) +
  labs(title    = "Financial Exposure and Recovery by Fraud Scheme",
       subtitle = "Multi-case forensic investigation — control failure mapping and litigation support documentation",
       x = "Amount (AED Millions)", y = NULL, fill = NULL,
       caption  = "Forensic Fraud Investigation Toolkit · Chain of Custody Maintained") +
  pt("top")

save_chart(p7a, "fraud-cases", "scheme-analysis.png")

# 7b. Investigation Stage Duration (Methodology Waterfall)
df_stages <- data.frame(
  stage     = c("Preliminary\nAssessment", "Evidence\nCollection",
                "Data\nAnalysis", "Findings\nDocumentation",
                "Litigation\nSupport", "Recovery\nAction Plan"),
  days      = c(5, 14, 21, 10, 18, 7),
  order     = 1:6
)
df_stages <- df_stages |>
  mutate(end   = cumsum(days),
         start = lag(end, default = 0),
         mid   = (start + end) / 2)

p7b <- ggplot(df_stages, aes(y = reorder(stage, -order),
                              xmin = start, xmax = end)) +
  geom_errorbarh(aes(xmin = start, xmax = end, y = reorder(stage, -order)),
                 height = 0.5, colour = NAVY, linewidth = 5.5, alpha = 0.85) +
  geom_text(aes(x = mid, y = reorder(stage, -order),
                label = paste0(days, "d")),
            colour = "white", size = 3, fontface = "bold") +
  scale_x_continuous(name = "Cumulative Investigation Days",
                     breaks = seq(0, 80, 10)) +
  labs(title    = "Forensic Investigation Methodology — Stage Duration",
       subtitle = "Structured 75-day engagement lifecycle from preliminary assessment to recovery action",
       y = NULL,
       caption  = "Forensic Fraud Investigation Toolkit · IIA & ACFE-Aligned Methodology") +
  pt()

save_chart(p7b, "fraud-cases", "investigation-stages.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 8. MULTI-LOCATION AUDIT COMPLIANCE  (restaurant-audit)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 8. Multi-Location Compliance ──")

# 8a. Compliance League Table — Top 10 and Bottom 10 Locations
set.seed(7)
n <- 70
scores <- round(rnorm(n, mean = 74, sd = 12))
scores <- pmin(pmax(scores, 38), 99)
locations <- paste0("Loc ", sprintf("%02d", 1:n))
df_all <- data.frame(location = locations, score = scores) |>
  arrange(desc(score)) |>
  mutate(rank = row_number())

df_league <- bind_rows(
  df_all |> slice(1:10) |> mutate(group = "Top 10"),
  df_all |> slice((n-9):n) |> mutate(group = "Bottom 10")
) |>
  mutate(bar_col = ifelse(score >= 80, GREEN,
                          ifelse(score >= 60, AMBER, RED)),
         group = factor(group, levels = c("Top 10", "Bottom 10")))
df_league$location <- reorder(df_league$location, df_league$score)

p8a <- ggplot(df_league, aes(y = location, x = score, fill = bar_col)) +
  geom_col(width = 0.65) +
  geom_text(aes(label = paste0(score, "%")),
            hjust = -0.3, size = 2.8, fontface = "bold", colour = SLATE) +
  geom_vline(xintercept = 70, linetype = "dashed", colour = GOLD, linewidth = 0.8) +
  scale_fill_identity() +
  scale_x_continuous(labels = percent_format(scale = 1), limits = c(0, 110)) +
  facet_wrap(~group, scales = "free_y", ncol = 2) +
  labs(title    = "Compliance League Table — Top 10 and Bottom 10 Locations",
       subtitle = "Standardised audit scoring across 70+ locations | Dashed line = 70% minimum threshold",
       x = "Compliance Score", y = NULL,
       caption  = "Multi-Location Audit Compliance System · Weighted Scoring Framework") +
  pt() +
  theme(strip.text = element_text(colour = NAVY, face = "bold", size = 9),
        strip.background = element_rect(fill = paste0(NAVY, "12"), colour = NA))

save_chart(p8a, "restaurant-audit", "compliance-league.png", w = 9, h = 6)

# 8b. Compliance Trend — Audit Cycle Over Time
df_trend <- data.frame(
  cycle    = rep(c("Cycle 1\n(Baseline)", "Cycle 2", "Cycle 3", "Cycle 4\n(Current)"), 4),
  quartile = rep(c("Top Quartile", "2nd Quartile", "3rd Quartile", "Bottom Quartile"), each = 4),
  score    = c(88, 90, 92, 95,
               74, 76, 79, 82,
               60, 63, 67, 72,
               42, 47, 53, 61)
)
df_trend$cycle    <- factor(df_trend$cycle,
                            levels = c("Cycle 1\n(Baseline)", "Cycle 2",
                                       "Cycle 3", "Cycle 4\n(Current)"))
df_trend$quartile <- factor(df_trend$quartile,
                            levels = c("Top Quartile", "2nd Quartile",
                                       "3rd Quartile", "Bottom Quartile"))

p8b <- ggplot(df_trend, aes(x = cycle, y = score, colour = quartile,
                             group = quartile)) +
  geom_line(linewidth = 1.3) +
  geom_point(size = 3.5) +
  geom_text(aes(label = paste0(score, "%")),
            vjust = -0.8, size = 2.7, fontface = "bold") +
  geom_hline(yintercept = 70, linetype = "dashed", colour = GOLD, linewidth = 0.7) +
  scale_colour_manual(values = c(NAVY, TEAL, AMBER, RED)) +
  scale_y_continuous(labels = percent_format(scale = 1),
                     limits = c(30, 105), breaks = seq(30, 100, 10)) +
  labs(title    = "Compliance Score Trend by Location Quartile — Four Audit Cycles",
       subtitle = "All quartiles improving; bottom quartile lifted from 42% to 61% across the programme",
       x = NULL, y = "Compliance Score", colour = NULL,
       caption  = "Multi-Location Audit Compliance System · Remediation Tracking Embedded") +
  pt("right")

save_chart(p8b, "restaurant-audit", "compliance-trend.png")

# ═══════════════════════════════════════════════════════════════════════════════
# 9. CORPORATE GOVERNANCE FRAMEWORK — KSA HOLDING GROUP  (holding-group-governance)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 9. Holding Group Governance ──")

# 9a. Governance Maturity — Baseline vs Post-Engagement
df_gov <- data.frame(
  domain    = c("Board Structure\n& Independence", "Audit Committee",
                "Risk Management", "Internal Controls",
                "Ethics & Integrity", "Disclosure &\nTransparency",
                "Delegation of\nAuthority", "Regulatory\nCompliance"),
  baseline  = c(35, 40, 30, 45, 50, 35, 25, 55),
  delivered = c(88, 92, 82, 86, 90, 85, 88, 91)
)
df_gov <- df_gov |>
  mutate(domain = reorder(domain, delivered))

df_gov_long <- df_gov |>
  pivot_longer(c(baseline, delivered), names_to = "stage", values_to = "score") |>
  mutate(stage = recode(stage, baseline = "Pre-Engagement", delivered = "Framework Delivered"))
df_gov_long$stage <- factor(df_gov_long$stage,
                            levels = c("Pre-Engagement", "Framework Delivered"))

p9a <- ggplot(df_gov_long, aes(y = domain, x = score, fill = stage)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(score, "%")),
            position = position_dodge(width = 0.7),
            hjust = -0.2, size = 2.8, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(paste0(NAVY, "35"), NAVY)) +
  scale_x_continuous(labels = percent_format(scale = 1),
                     limits = c(0, 108), breaks = seq(0, 100, 25)) +
  labs(title    = "Corporate Governance Maturity — Pre-Engagement vs Framework Delivered",
       subtitle = "KSA multi-sector holding group | Saudi Companies Law & King IV alignment",
       x = "Maturity Score", y = NULL, fill = NULL,
       caption  = "Corporate Governance Framework · Board-Adopted Governance Manual") +
  pt("top")

save_chart(p9a, "holding-group-governance", "governance-maturity.png", w = 9, h = 5.5)

# 9b. Three Lines of Defence — Activity Coverage
df_3lines <- data.frame(
  activity  = rep(c("Risk Identification", "Control Design", "Control Operation",
                    "Compliance Monitoring", "Assurance & Reporting",
                    "Board Oversight"), each = 3),
  line      = rep(c("Line 1: Business", "Line 2: GRC & Risk", "Line 3: Internal Audit"), 6),
  coverage  = c(90, 60, 30,   # Risk Identification
                70, 80, 40,   # Control Design
                85, 50, 20,   # Control Operation
                40, 90, 60,   # Compliance Monitoring
                20, 70, 95,   # Assurance & Reporting
                10, 40, 80)   # Board Oversight
)
df_3lines$line <- factor(df_3lines$line,
                         levels = c("Line 3: Internal Audit",
                                    "Line 2: GRC & Risk",
                                    "Line 1: Business"))

p9b <- ggplot(df_3lines, aes(y = activity, x = coverage, fill = line)) +
  geom_col(position = position_dodge(width = 0.75), width = 0.65) +
  geom_text(aes(label = paste0(coverage, "%")),
            position = position_dodge(width = 0.75),
            hjust = -0.25, size = 2.6, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(TEAL, GOLD, NAVY)) +
  scale_x_continuous(labels = percent_format(scale = 1),
                     limits = c(0, 115), breaks = seq(0, 100, 25)) +
  labs(title    = "Three Lines of Defence — Control Activity Coverage",
       subtitle = "Accountability distributed across all entities of the KSA holding group structure",
       x = "Coverage %", y = NULL, fill = NULL,
       caption  = "Corporate Governance Framework · IIA Three Lines Model · Holding & Subsidiaries") +
  pt("top")

save_chart(p9b, "holding-group-governance", "three-lines-coverage.png", w = 9, h = 5.5)

# ═══════════════════════════════════════════════════════════════════════════════
# 10. ICAEW AUDIT REPORT SYSTEM  (icaew-audit)
# ═══════════════════════════════════════════════════════════════════════════════
message("\n── 10. ICAEW Audit System ──")

# 10a. Time Savings — Manual vs Automated Workflow
df_time <- data.frame(
  phase     = c("Workpaper\nPreparation", "Report\nFormatting",
                "Evidence\nIndexing", "Quality\nReview",
                "Findings\nDocumentation", "Sign-off &\nFiling"),
  manual_h  = c(18, 12, 8, 6, 7, 5),
  auto_h    = c(4, 2, 1, 4, 2, 1)
)
df_time$phase <- factor(df_time$phase, levels = df_time$phase)

df_time_long <- df_time |>
  pivot_longer(c(manual_h, auto_h), names_to = "mode", values_to = "hours") |>
  mutate(mode = recode(mode, manual_h = "Manual Process", auto_h = "Automated System"))
df_time_long$mode <- factor(df_time_long$mode,
                            levels = c("Manual Process", "Automated System"))

p10a <- ggplot(df_time_long, aes(x = phase, y = hours, fill = mode)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(hours, "h")),
            position = position_dodge(width = 0.7),
            vjust = -0.4, size = 2.8, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(paste0(NAVY, "35"), NAVY)) +
  scale_y_continuous(limits = c(0, 22), breaks = seq(0, 20, 5),
                     labels = function(x) paste0(x, "h")) +
  labs(title    = "Audit Engagement Time — Manual vs Automated Workflow",
       subtitle = "65% average reduction in document preparation time across all engagement phases",
       x = NULL, y = "Hours per Engagement", fill = NULL,
       caption  = "ICAEW Audit Report System · ICAEW Standards Embedded Automatically") +
  pt("top")

save_chart(p10a, "icaew-audit", "time-savings.png")

# 10b. Testing Coverage by Audit Assertion
df_assert <- data.frame(
  assertion   = c("Existence /\nOccurrence", "Completeness",
                  "Valuation &\nAccuracy", "Rights &\nObligations",
                  "Cut-off", "Presentation &\nDisclosure",
                  "Classification", "Understandability"),
  coverage_pct = c(98, 95, 97, 92, 89, 94, 96, 88),
  prior_pct    = c(72, 68, 75, 64, 58, 70, 74, 61)
)
df_assert <- df_assert |>
  mutate(assertion = reorder(assertion, coverage_pct))

df_assert_long <- df_assert |>
  pivot_longer(c(coverage_pct, prior_pct), names_to = "period", values_to = "pct") |>
  mutate(period = recode(period,
                         coverage_pct = "Current System",
                         prior_pct    = "Prior Manual Process"))
df_assert_long$period <- factor(df_assert_long$period,
                                levels = c("Prior Manual Process", "Current System"))

p10b <- ggplot(df_assert_long, aes(y = assertion, x = pct, fill = period)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(pct, "%")),
            position = position_dodge(width = 0.7),
            hjust = -0.2, size = 2.8, fontface = "bold", colour = SLATE) +
  scale_fill_manual(values = c(paste0(NAVY, "35"), NAVY)) +
  scale_x_continuous(labels = percent_format(scale = 1),
                     limits = c(0, 112), breaks = seq(0, 100, 25)) +
  labs(title    = "Audit Testing Coverage by Financial Statement Assertion",
       subtitle = "ICAEW-compliant testing methodology auto-populated based on audit area and risk level",
       x = "Coverage %", y = NULL, fill = NULL,
       caption  = "ICAEW Audit Report System · 100% Population Testing Approach") +
  pt("top")

save_chart(p10b, "icaew-audit", "testing-coverage.png", w = 8.5, h = 5.5)

message("\n✓ All 20 charts generated successfully.")
