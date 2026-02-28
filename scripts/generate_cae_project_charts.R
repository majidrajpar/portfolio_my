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
# PROJECT 1 — CAE Establishment: Cloud Kitchen Tech Unicorn
# ══════════════════════════════════════════════════════════════════════════════
d1 <- file.path(ROOT, "cae-establishment")
dir.create(d1, recursive = TRUE, showWarnings = FALSE)

# Chart 1a: Function Build-Out Timeline (Gantt)
phases <- data.frame(
  phase  = factor(
    c("Audit Charter & Mandate",
      "Team Recruitment (5 Core + 2 InfoSec Indirect)",
      "Audit Committee ToR & Governance",
      "SOX 404 ICOFR — Design & Documentation",
      "Controls Testing & External Audit",
      "Continuous Monitoring Suite",
      "Board-Approved Automation Investment"),
    levels = rev(c(
      "Audit Charter & Mandate",
      "Team Recruitment (5 Core + 2 InfoSec Indirect)",
      "Audit Committee ToR & Governance",
      "SOX 404 ICOFR — Design & Documentation",
      "Controls Testing & External Audit",
      "Continuous Monitoring Suite",
      "Board-Approved Automation Investment"))
  ),
  start  = c(0,  1,  2,  3,  9, 12, 30),
  end    = c(2,  6,  5,  9, 27, 36, 36),
  stream = c("Governance", "People", "Governance", "SOX 404",
             "SOX 404", "Technology", "Technology")
)
phases$duration <- phases$end - phases$start
phases$mid      <- phases$start + phases$duration / 2

stream_cols <- c(
  "Governance"  = NAVY,
  "People"      = GOLD,
  "SOX 404"     = "#1D4ED8",
  "Technology"  = GREEN
)

p1a <- ggplot(phases) +
  geom_tile(
    aes(x = mid, y = phase, width = duration, height = 0.68, fill = stream),
    alpha = 0.90
  ) +
  geom_text(
    aes(x = mid, y = phase, label = paste0(duration, "m")),
    size = 3, colour = WHITE, fontface = "bold", show.legend = FALSE
  ) +
  scale_fill_manual(values = stream_cols, name = "Work Stream") +
  scale_x_continuous(
    breaks = seq(0, 36, 6),
    labels = paste0("M", seq(0, 36, 6)),
    limits = c(0, 38)
  ) +
  BASE_THEME +
  theme(
    panel.grid.major.y = element_blank(),
    legend.position    = "bottom"
  ) +
  labs(
    title    = "Internal Audit Function Build-Out Timeline",
    subtitle = "UAE Cloud Kitchen Technology Unicorn — Jun 2022 to May 2025 (36 months)",
    x        = "Months from Inception",
    y        = NULL,
    caption  = "All client identifiers anonymised. Function built with no prior internal audit infrastructure."
  )

ggsave(file.path(d1, "function-timeline.png"), p1a, width = 11, height = 5.5, dpi = 180)
message("1a done")

# Chart 1b: SOX 404 Process Coverage
sox <- data.frame(
  process = factor(
    c("Revenue & Aggregator Billing", "Procure-to-Pay", "Payroll & HR",
      "Treasury & Cash Management", "Financial Close & Reporting",
      "IT General Controls", "Third-Party Vendor Management"),
    levels = rev(c("Revenue & Aggregator Billing", "Procure-to-Pay", "Payroll & HR",
                   "Treasury & Cash Management", "Financial Close & Reporting",
                   "IT General Controls", "Third-Party Vendor Management"))
  ),
  controls  = c(33, 28, 21, 18, 26, 22, 27),
  effective = c(33, 27, 21, 18, 25, 21, 27),
  risk      = c("High", "High", "Medium", "Medium", "High", "High", "High")
)
sox$pct <- round(sox$effective / sox$controls * 100)

p1b <- ggplot(sox, aes(y = process)) +
  geom_col(aes(x = controls),  fill = "#E2E8F0", width = 0.65) +
  geom_col(aes(x = effective, fill = risk), width = 0.65, alpha = 0.9) +
  geom_text(
    aes(x = effective + 0.6, label = paste0(pct, "%  effective")),
    hjust = 0, size = 3.2, colour = SLATE, fontface = "bold"
  ) +
  scale_fill_manual(
    values = c("High" = NAVY, "Medium" = GOLD),
    name   = "Inherent Risk"
  ) +
  scale_x_continuous(limits = c(0, 42), breaks = seq(0, 40, 10)) +
  BASE_THEME +
  theme(panel.grid.major.y = element_blank()) +
  labs(
    title    = "SOX 404 ICOFR — Process Coverage & Control Effectiveness",
    subtitle = "Clean first-time external audit opinion · Zero material weaknesses or significant deficiencies",
    x        = "Controls Documented & Tested",
    y        = NULL,
    caption  = "7 key processes scoped · 175+ controls designed, documented in Risk Control Matrices, and tested for design and operating effectiveness."
  )

ggsave(file.path(d1, "sox-coverage.png"), p1b, width = 11, height = 5, dpi = 180)
message("1b done")

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT 2 — QSR Risk-Based Audit Transformation
# ══════════════════════════════════════════════════════════════════════════════
d2 <- file.path(ROOT, "qsr-transformation")
dir.create(d2, recursive = TRUE, showWarnings = FALSE)

# Chart 2a: Before/After Audit Coverage Composition
coverage <- data.frame(
  state    = factor(
    c(rep("Before", 3), rep("After", 5)),
    levels = c("Before", "After")
  ),
  domain   = c(
    "Restaurant Ops Checks", "Basic Compliance", "Other",
    "Financial & Commercial", "Franchise Integrity", "IT & Systems",
    "Regulatory Compliance", "Restaurant Ops"
  ),
  pct      = c(75, 20, 5,   30, 25, 20, 15, 10)
)

domain_cols <- c(
  "Restaurant Ops Checks"  = LIGHT,
  "Basic Compliance"       = "#CBD5E1",
  "Other"                  = "#E2E8F0",
  "Financial & Commercial" = NAVY,
  "Franchise Integrity"    = "#1D4ED8",
  "IT & Systems"           = GOLD,
  "Regulatory Compliance"  = GREEN,
  "Restaurant Ops"         = "#64748B"
)

p2a <- ggplot(coverage, aes(x = state, y = pct, fill = domain)) +
  geom_col(width = 0.55) +
  geom_text(
    aes(label = paste0(pct, "%")),
    position = position_stack(vjust = 0.5),
    size = 3.2, colour = WHITE, fontface = "bold"
  ) +
  scale_fill_manual(values = domain_cols, name = "Audit Domain") +
  scale_y_continuous(labels = function(x) paste0(x, "%")) +
  BASE_THEME +
  theme(legend.position = "right") +
  labs(
    title    = "Audit Coverage Transformation — Before vs After",
    subtitle = "Shift from restaurant operations tick-box auditing to enterprise risk-based audit coverage",
    x        = NULL,
    y        = "% of Annual Audit Plan",
    caption  = "Global QSR Franchise, KSA · Mar 2014 – Oct 2016 · First enterprise risk assessment conducted in Year 1."
  )

ggsave(file.path(d2, "methodology-shift.png"), p2a, width = 9, height = 5.5, dpi = 180)
message("2a done")

# Chart 2b: Team Growth & Productivity Uplift
metrics <- data.frame(
  phase  = factor(rep(c("On Joining", "On Departure"), 2), levels = c("On Joining", "On Departure")),
  metric = c("Team Size", "Team Size", "Productivity Index", "Productivity Index"),
  value  = c(2, 5, 100, 170)
)

metrics$fill_col <- ifelse(metrics$phase == "On Joining", LIGHT, NAVY)
metrics$fill_col[metrics$metric == "Productivity Index" & metrics$phase == "On Departure"] <- GREEN

label_data <- data.frame(
  phase  = factor(c("On Joining", "On Departure", "On Joining", "On Departure"),
                  levels = c("On Joining", "On Departure")),
  metric = c("Team Size", "Team Size", "Productivity Index", "Productivity Index"),
  value  = c(2, 5, 100, 170),
  label  = c("2 auditors", "5 auditors", "Baseline", "+70%\n170 index")
)

p2b <- ggplot(metrics, aes(x = phase, y = value, fill = phase)) +
  geom_col(width = 0.55, alpha = 0.9) +
  geom_text(
    data = label_data,
    aes(x = phase, y = value / 2, label = label),
    size = 3.8, colour = WHITE, fontface = "bold", inherit.aes = FALSE
  ) +
  scale_fill_manual(
    values = c("On Joining" = LIGHT, "On Departure" = NAVY),
    guide  = "none"
  ) +
  facet_wrap(~ metric, scales = "free_y", nrow = 1) +
  BASE_THEME +
  theme(
    strip.text        = element_text(size = 10, colour = NAVY, face = "bold"),
    panel.grid.major.x = element_blank()
  ) +
  labs(
    title    = "Audit Function Growth & Productivity Uplift",
    subtitle = "Team tripled from 2 to 5 professionals · 70% increase in audit team productivity and utilisation",
    x        = NULL,
    y        = NULL,
    caption  = "Global QSR Franchise, KSA · Risk-based audit plan approved by Board and Audit Committee · Mar 2014 – Oct 2016"
  )

ggsave(file.path(d2, "productivity-gains.png"), p2b, width = 9, height = 5, dpi = 180)
message("2b done")

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT 3 — Group Audit Leadership: Saudi Diversified Conglomerate (JSC)
# ══════════════════════════════════════════════════════════════════════════════
d3 <- file.path(ROOT, "group-audit-leadership")
dir.create(d3, recursive = TRUE, showWarnings = FALSE)

# Chart 3a: Group-Wide Team Scaling
team_data <- data.frame(
  year   = rep(2017:2022, each = 2),
  entity = rep(c("Holding Company", "Portfolio Companies"), times = 6),
  count  = c(3, 5,  4, 9,  5, 14,  5, 17,  5, 20,  5, 23)
)
team_data$entity <- factor(team_data$entity, levels = c("Portfolio Companies", "Holding Company"))

totals <- team_data %>%
  group_by(year) %>%
  summarise(total = sum(count), .groups = "drop")

p3a <- ggplot(team_data, aes(x = factor(year), y = count, fill = entity)) +
  geom_col(position = "stack", width = 0.6) +
  geom_text(
    data = totals,
    aes(x = factor(year), y = total, label = total, fill = NULL),
    vjust = -0.5, size = 3.8, colour = NAVY, fontface = "bold",
    inherit.aes = FALSE
  ) +
  scale_fill_manual(
    values = c("Holding Company" = GOLD, "Portfolio Companies" = NAVY),
    name   = "Audit Function"
  ) +
  scale_y_continuous(limits = c(0, 34), breaks = seq(0, 30, 10)) +
  BASE_THEME +
  theme(legend.position = "bottom") +
  labs(
    title    = "Group-Wide Audit Team Scaling — Holding & Portfolio Companies",
    subtitle = "From 3 professionals at holding company to 28 across the group over 5.5 years",
    x        = NULL,
    y        = "Total Audit Professionals",
    caption  = "Saudi Diversified Conglomerate (JSC) · Portfolio audit directors reported functionally to the Group Director."
  )

ggsave(file.path(d3, "team-scaling.png"), p3a, width = 10, height = 5.5, dpi = 180)
message("3a done")

# Chart 3b: Programme Outcomes — 2x2 Scorecard
scorecard <- data.frame(
  row   = c(1, 1, 2, 2),
  col   = c(1, 2, 1, 2),
  value = c("82%", "$127M", "SAR 4.2M", "28"),
  label = c("Fraud Loss\nReduction", "M&A Capital\nProtected", "Annual Fraud\nSavings", "Audit Professionals\nGroup-Wide"),
  sub   = c("vs baseline", "deal value protected", "quantified savings", "scaled from 3"),
  fill  = c(RED, NAVY, GREEN, GOLD)
)

p3b <- ggplot(scorecard, aes(x = col, y = row)) +
  geom_tile(aes(fill = fill), width = 0.92, height = 0.88, alpha = 0.92) +
  geom_text(
    aes(label = value),
    size = 11, colour = WHITE, fontface = "bold", vjust = 0.8
  ) +
  geom_text(
    aes(label = label),
    size = 3.6, colour = WHITE, fontface = "bold", vjust = -1.6, lineheight = 1.1
  ) +
  geom_text(
    aes(label = sub),
    size = 2.8, colour = "white", alpha = 0.75, vjust = 5.0
  ) +
  scale_fill_identity() +
  scale_x_continuous(limits = c(0.5, 2.5)) +
  scale_y_continuous(limits = c(0.5, 2.5)) +
  BASE_THEME +
  theme(
    axis.text     = element_blank(),
    axis.title    = element_blank(),
    panel.grid    = element_blank(),
    plot.subtitle = element_text(hjust = 0.5)
  ) +
  labs(
    title    = "Group Audit Programme — Key Outcomes",
    subtitle = "IIA 'Generally Conforms' (Highest External Quality Assessment Rating) · Saudi Corporate Governance Regulations · Nov 2016 – May 2022",
    caption  = "Saudi Diversified Conglomerate (JSC) · All client identifiers anonymised."
  )

ggsave(file.path(d3, "outcomes-dashboard.png"), p3b, width = 10, height = 5.5, dpi = 180)
message("3b done")

message("\n✓ All 6 charts generated successfully.")
