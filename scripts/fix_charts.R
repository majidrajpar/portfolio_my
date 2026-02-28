
library(ggplot2)
library(dplyr)
library(tidyr)
library(scales)

NAVY   <- "#001F5B"
GOLD   <- "#C9A84C"
SLATE  <- "#475569"
LIGHT  <- "#94a3b8"
RED    <- "#dc2626"
AMBER  <- "#d97706"
GREEN  <- "#16a34a"
ORANGE <- "#ea580c"
TEAL   <- "#0f766e"

BASE <- "C:/Users/sorat/Desktop/Coding/portfolio_my/public/images/projects"

pt <- function(legend_pos = "none") {
  theme_minimal(base_size = 11) +
    theme(
      plot.background   = element_rect(fill = "white", colour = NA),
      panel.background  = element_rect(fill = "white", colour = NA),
      panel.grid.major  = element_line(colour = "#f1f5f9", linewidth = 0.5),
      panel.grid.minor  = element_blank(),
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

# ── FIX 1: KPI Performance (correct direction + unit labels) ─────────────────
message("\n── Fix 1: KPI Performance ──")

df_kpi <- data.frame(
  kpi             = c("Revenue (AEDm)", "EBITDA Margin", "Cost Ratio",
                       "Working Capital Days", "Recovery Rate", "Budget Adherence"),
  target          = c(100, 40, 60, 45, 85, 95),
  actual          = c(127, 37.5, 58, 38, 91, 88),
  lower_is_better = c(FALSE, FALSE, TRUE, TRUE, FALSE, FALSE),
  unit            = c("M", "%", "%", "d", "%", "%")
)
df_kpi <- df_kpi |>
  mutate(kpi    = reorder(kpi, actual),
         on_tgt = case_when(
           lower_is_better  & actual <= target ~ GREEN,
           lower_is_better  & actual >  target ~ ORANGE,
           !lower_is_better & actual >= target ~ GREEN,
           TRUE                                ~ ORANGE),
         gap    = actual - target)

p3b <- ggplot(df_kpi) +
  geom_segment(aes(y = kpi, yend = kpi, x = target, xend = actual,
                   colour = on_tgt), linewidth = 1.4) +
  geom_point(aes(y = kpi, x = target), colour = LIGHT, size = 3.5) +
  geom_point(aes(y = kpi, x = actual, colour = on_tgt), size = 4.5) +
  geom_text(aes(y = kpi, x = actual,
                label = paste0(actual, unit)),
            hjust = -0.5, size = 2.9, fontface = "bold", colour = SLATE) +
  scale_colour_identity() +
  scale_x_continuous(expand = expansion(mult = c(0.02, 0.18))) +
  labs(title    = "KPI Performance vs Target — Full Year",
       subtitle = "Green = on/above target  |  Orange = below target  |  Grey dot = target",
       x = "Score / Value", y = NULL,
       caption  = "Executive Financial Dashboard · Board KPI Pack") +
  pt()

save_chart(p3b, "finance-dashboard", "kpi-performance.png")

# ── FIX 2: Investigation Stages — geom_tile Gantt ────────────────────────────
message("\n── Fix 2: Investigation Stages ──")

df_stages <- data.frame(
  stage = c("Preliminary\nAssessment", "Evidence\nCollection",
            "Data\nAnalysis", "Findings\nDocumentation",
            "Litigation\nSupport", "Recovery\nAction Plan"),
  days  = c(5, 14, 21, 10, 18, 7),
  order = 1:6
)
df_stages <- df_stages |>
  mutate(end   = cumsum(days),
         start = lag(end, default = 0),
         mid   = (start + end) / 2)

p7b <- ggplot(df_stages) +
  geom_tile(aes(x = mid, y = reorder(stage, -order),
                width = days, height = 0.72),
            fill = NAVY, alpha = 0.88) +
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

# ── FIX 3: Compliance Trend — remove legend "a" artifact ─────────────────────
message("\n── Fix 3: Compliance Trend ──")

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
            vjust = -0.8, size = 2.7, fontface = "bold", show.legend = FALSE) +
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

message("\n✓ 3 charts fixed and regenerated.")
