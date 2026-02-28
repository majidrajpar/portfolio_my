library(ggplot2)
library(dplyr)

NAVY  <- "#001F5B"
GOLD  <- "#C9A84C"
SLATE <- "#475569"
LIGHT <- "#94A3B8"
BG    <- "#FAFAFA"
WHITE <- "#FFFFFF"
GREEN <- "#16A34A"
RED   <- "#DC2626"
BLUE  <- "#1D4ED8"

BASE_THEME <- theme_minimal(base_family = "sans") +
  theme(
    plot.background  = element_rect(fill = BG, colour = NA),
    panel.background = element_rect(fill = BG, colour = NA),
    panel.grid.major = element_line(colour = "#E2E8F0", linewidth = 0.4),
    panel.grid.minor = element_blank(),
    axis.text        = element_text(size = 9,  colour = SLATE),
    axis.title       = element_text(size = 9,  colour = SLATE, face = "bold"),
    plot.title       = element_text(size = 13, colour = NAVY, face = "bold", margin = margin(b = 4)),
    plot.subtitle    = element_text(size = 9,  colour = SLATE, margin = margin(b = 14)),
    plot.caption     = element_text(size = 7.5, colour = LIGHT, hjust = 0, margin = margin(t = 10)),
    plot.margin      = margin(20, 24, 16, 20),
    legend.text      = element_text(size = 8.5, colour = SLATE),
    legend.title     = element_text(size = 8.5, colour = SLATE, face = "bold")
  )

ROOT <- "public/images/projects"

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT 1 — CAE Establishment: 2 additional charts
# ══════════════════════════════════════════════════════════════════════════════
d1 <- file.path(ROOT, "cae-establishment")

# Chart 1c: Financial Impact by Monitoring Domain (AED 7.7M breakdown)
impact <- data.frame(
  domain    = factor(
    c("Aggregator Billing",   "Aggregator Billing",
      "Vendor Payments",      "Inventory Management",
      "Concessions & Voids",  "Payroll & HR",
      "Treasury & Cash",      "T&E & Capex"),
    levels = c("T&E & Capex", "Treasury & Cash", "Payroll & HR",
               "Concessions & Voids", "Inventory Management",
               "Vendor Payments", "Aggregator Billing")
  ),
  type      = c("Recovered", "Protected", "Protected", "Protected",
                "Protected", "Protected", "Protected", "Protected"),
  value_aed = c(3.2, 1.5, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2)
)

type_cols <- c("Recovered" = RED, "Protected" = NAVY)

# Compute bar right edges for outside labels
impact_totals <- impact %>%
  group_by(domain) %>%
  summarise(total = sum(value_aed), .groups = "drop")

p1c <- ggplot(impact, aes(y = domain, x = value_aed, fill = type)) +
  geom_col(width = 0.6, position = "stack") +
  geom_text(
    data = impact_totals,
    aes(y = domain, x = total, label = paste0("AED ", total, "M"), fill = NULL),
    hjust = -0.12, size = 3.2, colour = SLATE, fontface = "bold",
    inherit.aes = FALSE
  ) +
  scale_fill_manual(values = type_cols, name = "Impact Type") +
  scale_x_continuous(
    labels = function(x) paste0("AED ", x, "M"),
    breaks = seq(0, 5, 1),
    limits = c(0, 5.5)
  ) +
  BASE_THEME +
  theme(panel.grid.major.y = element_blank()) +
  labs(
    title    = "Continuous Monitoring Suite — Financial Impact by Domain",
    subtitle = "AED 7.7M total impact captured: AED 3.2M recovered + AED 4.5M protected across 7 monitored domains",
    x        = "Financial Impact (AED Millions)",
    y        = NULL,
    caption  = "UAE Cloud Kitchen Technology Unicorn · Automated continuous monitoring deployed across all 7 critical transaction domains."
  )

ggsave(file.path(d1, "financial-impact.png"), p1c, width = 11, height = 5, dpi = 180)
message("1c done")

# Chart 1d: Sample-Based vs 100% Population Testing
testing <- data.frame(
  domain   = factor(
    c("Revenue & Aggregator Billing", "Vendor & Procurement",
      "Payroll & HR", "Treasury & Cash",
      "Financial Close", "IT General Controls",
      "Concessions & Voids"),
    levels = rev(c("Revenue & Aggregator Billing", "Vendor & Procurement",
                   "Payroll & HR", "Treasury & Cash",
                   "Financial Close", "IT General Controls",
                   "Concessions & Voids"))
  ),
  before_pct = c(8, 10, 12, 15, 10, 8, 5),
  after_pct  = rep(100, 7)
)

testing_long <- rbind(
  data.frame(domain = testing$domain, pct = testing$before_pct, phase = "Sample-Based (Before)"),
  data.frame(domain = testing$domain, pct = testing$after_pct,  phase = "Population Testing (After)")
)
testing_long$phase <- factor(testing_long$phase,
  levels = c("Sample-Based (Before)", "Population Testing (After)"))

p1d <- ggplot(testing_long, aes(y = domain, x = pct, fill = phase)) +
  geom_col(position = "dodge", width = 0.65, alpha = 0.92) +
  geom_text(
    aes(label = paste0(pct, "%")),
    position = position_dodge(width = 0.65),
    hjust = -0.15, size = 3.2, colour = SLATE, fontface = "bold"
  ) +
  scale_fill_manual(
    values = c("Sample-Based (Before)" = LIGHT, "Population Testing (After)" = GREEN),
    name   = NULL
  ) +
  scale_x_continuous(limits = c(0, 120), labels = function(x) paste0(x, "%")) +
  BASE_THEME +
  theme(
    panel.grid.major.y = element_blank(),
    legend.position    = "bottom"
  ) +
  labs(
    title    = "Audit Methodology Shift — Sample Testing to 100% Population Testing",
    subtitle = "Python/Pandas analytics engine enabled full-population coverage across all 7 critical domains",
    x        = "Transaction Population Tested (%)",
    y        = NULL,
    caption  = "UAE Cloud Kitchen Technology Unicorn · Board-approved investment in enterprise automation secured on the strength of this methodology shift."
  )

ggsave(file.path(d1, "population-testing.png"), p1d, width = 11, height = 5, dpi = 180)
message("1d done")

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT 2 — QSR Transformation: 2 additional charts
# ══════════════════════════════════════════════════════════════════════════════
d2 <- file.path(ROOT, "qsr-transformation")

# Chart 2c: Enterprise Risk Assessment Heat Map (no ggnewscale — zones via annotate)
# Slight jitter on (4,4) collision: Brand Standards & Food Safety
risks <- data.frame(
  likelihood = c(4,   5,   3,   3.8, 5,   3,   2,   4,   3,   4.2, 2,   3),
  impact     = c(5,   5,   5,   4.2, 4,   4,   5,   3,   4,   3.8, 3,   3),
  label      = c("Revenue\nLeakage", "Financial\nMisstatement", "Regulatory\nBreach",
                 "Brand\nStandards", "Vendor\nFraud", "VAT\nCompliance",
                 "Supply\nChain", "Franchise\nNon-Comply", "Labour\nLaw",
                 "Food\nSafety", "Cash\nHandling", "Ops\nIntegrity")
)
risks$risk_score <- risks$likelihood * risks$impact
risks$priority   <- cut(risks$risk_score,
  breaks = c(0, 8, 12, 20, 25),
  labels = c("Low", "Medium", "High", "Critical"))

priority_cols <- c("Low" = "#94A3B8", "Medium" = GOLD, "High" = "#EA580C", "Critical" = RED)

p2c <- ggplot(risks, aes(x = likelihood, y = impact)) +
  # Background zone rectangles via annotate (no fill aesthetic conflict)
  annotate("rect", xmin=0.5, xmax=2.5, ymin=0.5, ymax=2.5, fill="#EFF6FF", alpha=0.9) +
  annotate("rect", xmin=2.5, xmax=3.5, ymin=0.5, ymax=2.5, fill="#F0FDF4", alpha=0.9) +
  annotate("rect", xmin=0.5, xmax=2.5, ymin=2.5, ymax=3.5, fill="#F0FDF4", alpha=0.9) +
  annotate("rect", xmin=2.5, xmax=3.5, ymin=2.5, ymax=3.5, fill="#FEFCE8", alpha=0.9) +
  annotate("rect", xmin=3.5, xmax=5.5, ymin=0.5, ymax=2.5, fill="#FEFCE8", alpha=0.9) +
  annotate("rect", xmin=0.5, xmax=2.5, ymin=3.5, ymax=5.5, fill="#FEFCE8", alpha=0.9) +
  annotate("rect", xmin=2.5, xmax=3.5, ymin=3.5, ymax=5.5, fill="#FFF7ED", alpha=0.9) +
  annotate("rect", xmin=3.5, xmax=5.5, ymin=2.5, ymax=3.5, fill="#FFF7ED", alpha=0.9) +
  annotate("rect", xmin=3.5, xmax=5.5, ymin=3.5, ymax=5.5, fill="#FEF2F2", alpha=0.9) +
  # Zone labels
  annotate("text", x=1.5, y=1.2, label="LOW",      size=2.8, colour="#94A3B8", fontface="bold", alpha=0.7) +
  annotate("text", x=4.5, y=2.0, label="MEDIUM",   size=2.8, colour=GOLD,     fontface="bold", alpha=0.7) +
  annotate("text", x=3.0, y=4.5, label="HIGH",     size=2.8, colour="#EA580C",fontface="bold", alpha=0.7) +
  annotate("text", x=4.5, y=4.5, label="CRITICAL", size=2.8, colour=RED,      fontface="bold", alpha=0.7) +
  # Grid lines
  geom_hline(yintercept = 1:5 + 0.5, colour = "#E2E8F0", linewidth = 0.4) +
  geom_vline(xintercept = 1:5 + 0.5, colour = "#E2E8F0", linewidth = 0.4) +
  # Risk bubbles
  geom_point(aes(fill = priority, size = risk_score),
    shape = 21, colour = WHITE, stroke = 1.2, alpha = 0.94) +
  geom_text(aes(label = label),
    size = 2.0, colour = WHITE, fontface = "bold", lineheight = 0.85) +
  scale_fill_manual(values = priority_cols, name = "Priority") +
  scale_size_continuous(range = c(10, 20), guide = "none") +
  scale_x_continuous(breaks = 1:5,
    labels = c("Rare", "Unlikely", "Possible", "Likely", "Almost\nCertain"),
    limits = c(0.5, 5.5)) +
  scale_y_continuous(breaks = 1:5,
    labels = c("Negligible", "Minor", "Moderate", "Major", "Catastrophic"),
    limits = c(0.5, 5.5)) +
  BASE_THEME +
  theme(panel.grid = element_blank(), legend.position = "bottom") +
  labs(
    title    = "Enterprise Risk Assessment — Risk Heat Map",
    subtitle = "First-ever enterprise risk assessment for the KSA franchise operations — 12 risks plotted by likelihood and impact",
    x        = "Likelihood →",
    y        = "Impact →",
    caption  = "Global QSR Franchise, KSA · Risk assessment outcomes formed the basis of the risk-based annual audit plan."
  )

ggsave(file.path(d2, "risk-heatmap.png"), p2c, width = 10, height = 7, dpi = 180)
message("2c done")

# Chart 2d: Audit Findings Trend — Control Environment Improvement
findings <- data.frame(
  period   = factor(rep(c("Q1–Q2\nYear 1", "Q3–Q4\nYear 1", "Q1–Q2\nYear 2",
                          "Q3–Q4\nYear 2", "Year 3"), each = 4),
                    levels = c("Q1–Q2\nYear 1", "Q3–Q4\nYear 1",
                               "Q1–Q2\nYear 2", "Q3–Q4\nYear 2", "Year 3")),
  severity = factor(rep(c("Critical", "High", "Medium", "Low"), times = 5),
                    levels = c("Critical", "High", "Medium", "Low")),
  count    = c(
    6,  9, 11,  4,   # Q1-Q2 Yr1 — baseline (restaurant only)
    4,  8, 13,  7,   # Q3-Q4 Yr1 — risk plan kicks in
    2,  6, 14, 10,   # Q1-Q2 Yr2
    1,  4, 12, 13,   # Q3-Q4 Yr2
    0,  3, 10, 16    # Year 3 — management improving
  )
)

sev_cols <- c("Critical" = RED, "High" = "#EA580C", "Medium" = GOLD, "Low" = GREEN)

p2d <- ggplot(findings, aes(x = period, y = count, fill = severity)) +
  geom_col(position = "stack", width = 0.6) +
  geom_text(
    data = findings %>% group_by(period) %>% summarise(total = sum(count), .groups = "drop"),
    aes(x = period, y = total, label = total, fill = NULL),
    vjust = -0.4, size = 3.5, colour = NAVY, fontface = "bold", inherit.aes = FALSE
  ) +
  scale_fill_manual(values = sev_cols, name = "Severity") +
  scale_y_continuous(limits = c(0, 38), breaks = seq(0, 35, 5)) +
  BASE_THEME +
  theme(
    panel.grid.major.x = element_blank(),
    legend.position    = "bottom"
  ) +
  labs(
    title    = "Audit Findings Trend — Improving Control Environment",
    subtitle = "Critical and High findings declined steadily as risk-based audit plan and management remediation took effect",
    x        = NULL,
    y        = "Number of Audit Findings",
    caption  = "Global QSR Franchise, KSA · Findings classification aligned to IIA severity standards across all audit engagements."
  )

ggsave(file.path(d2, "findings-trend.png"), p2d, width = 10, height = 5.5, dpi = 180)
message("2d done")

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT 3 — Group Audit Leadership: 2 additional charts
# ══════════════════════════════════════════════════════════════════════════════
d3 <- file.path(ROOT, "group-audit-leadership")

# Chart 3c: Audit Engagements Across Group Entities
coverage <- data.frame(
  year   = rep(2017:2022, each = 3),
  entity = rep(c("Holding Company", "F&B Subsidiary (Alfa Co.)", "Portfolio Companies"), 6),
  count  = c(
    4,  0,  8,   # 2017
    5,  2, 12,   # 2018
    6,  4, 16,   # 2019
    7,  5, 18,   # 2020
    7,  6, 20,   # 2021
    8,  6, 22    # 2022
  )
)
coverage$entity <- factor(coverage$entity,
  levels = c("Portfolio Companies", "F&B Subsidiary (Alfa Co.)", "Holding Company"))

totals3c <- coverage %>%
  group_by(year) %>%
  summarise(total = sum(count), .groups = "drop")

entity_cols <- c(
  "Holding Company"            = GOLD,
  "F&B Subsidiary (Alfa Co.)" = BLUE,
  "Portfolio Companies"        = NAVY
)

p3c <- ggplot(coverage, aes(x = factor(year), y = count, fill = entity)) +
  geom_col(position = "stack", width = 0.62) +
  geom_text(
    data = totals3c,
    aes(x = factor(year), y = total, label = total, fill = NULL),
    vjust = -0.4, size = 3.8, colour = NAVY, fontface = "bold", inherit.aes = FALSE
  ) +
  scale_fill_manual(values = entity_cols, name = "Entity") +
  scale_y_continuous(limits = c(0, 45), breaks = seq(0, 40, 10)) +
  BASE_THEME +
  theme(
    panel.grid.major.x = element_blank(),
    legend.position    = "bottom"
  ) +
  labs(
    title    = "Group-Wide Audit Engagements — Coverage Across All Entities",
    subtitle = "Audit engagements grew from 12 in 2017 to 36 in 2022, spanning holding company, F&B subsidiary, and all portfolio companies",
    x        = NULL,
    y        = "Annual Audit Engagements",
    caption  = "Saudi Diversified Conglomerate (JSC) · F&B subsidiary (Alfa Co.) internal audit established from zero in 2018."
  )

ggsave(file.path(d3, "audit-coverage.png"), p3c, width = 10, height = 5.5, dpi = 180)
message("3c done")

# Chart 3d: IIA Quality Journey — Findings by Severity Over 5.5 Years
iia_findings <- data.frame(
  year     = rep(2017:2022, each = 4),
  severity = factor(rep(c("Critical", "High", "Medium", "Low"), 6),
                    levels = c("Critical", "High", "Medium", "Low")),
  count    = c(
    12, 22, 18,  8,   # 2017 — baseline, pre-IIA assessment
    10, 19, 22, 11,   # 2018
     7, 16, 24, 15,   # 2019
     4, 12, 26, 20,   # 2020
     2,  8, 24, 24,   # 2021
     1,  5, 20, 28    # 2022 — Generally Conforms achieved
  )
)

sev_cols2 <- c("Critical" = RED, "High" = "#EA580C", "Medium" = GOLD, "Low" = GREEN)

totals3d <- iia_findings %>%
  group_by(year) %>%
  summarise(total = sum(count), .groups = "drop")

p3d <- ggplot(iia_findings, aes(x = factor(year), y = count, fill = severity)) +
  geom_col(position = "stack", width = 0.62) +
  geom_text(
    data = totals3d %>% filter(year != 2022),
    aes(x = factor(year), y = total, label = total, fill = NULL),
    vjust = -0.4, size = 3.5, colour = NAVY, fontface = "bold", inherit.aes = FALSE
  ) +
  annotate("text", x = 6, y = 66,
    label = "IIA 'Generally\nConforms' Achieved",
    size = 3, colour = GREEN, fontface = "bold", lineheight = 1, hjust = 0.5) +
  annotate("segment", x = 6, xend = 6, y = 62, yend = 57,
    colour = GREEN, linewidth = 0.8,
    arrow = arrow(length = unit(0.2, "cm"), type = "closed")) +
  scale_fill_manual(values = sev_cols2, name = "Severity") +
  scale_y_continuous(limits = c(0, 74), breaks = seq(0, 60, 15)) +
  BASE_THEME +
  theme(
    panel.grid.major.x = element_blank(),
    legend.position    = "bottom"
  ) +
  labs(
    title    = "Group Audit — Findings Severity Profile & IIA Quality Journey",
    subtitle = "Critical and High findings declined 92% and 77% respectively over 5.5 years — culminating in IIA 'Generally Conforms' external quality assessment",
    x        = NULL,
    y        = "Audit Findings (Group-Wide)",
    caption  = "Saudi Diversified Conglomerate (JSC) · IIA 'Generally Conforms' is the highest rating awarded by the Institute of Internal Auditors."
  )

ggsave(file.path(d3, "findings-improvement.png"), p3d, width = 10, height = 5.5, dpi = 180)
message("3d done")

message("\n✓ All 6 additional charts generated successfully.")
