library(ggplot2)

BG   <- "#001F5B"
GOLD <- "#C9A84C"
WHITE <- "#FFFFFF"
GRAY  <- "#8895AA"

# ── Career milestones (CV-accurate, x positions spaced for visual clarity) ────
# EY: Dec 2004–Oct 2009 | BMA Asset Mgmt: Mar 2010–Apr 2011
# KPMG (Qatar): Apr 2011–Dec 2013 | McDonald's KSA: Mar 2014–Oct 2016
# Al-Faisaliah: Nov 2016–May 2022 (+ AC Member Feb 2021–May 2022)
# Kitopi: Jun 2022–May 2025 | Veritux: Jul 2025–Present
career <- data.frame(
  x = c(2005, 2009.5, 2012, 2015, 2019, 2023.5, 2026),
  y = c(0.14,  0.27,  0.38, 0.50, 0.61,  0.75,  0.87),
  company = c(
    "EY", "BMA ASSET\nMANAGEMENT", "KPMG\n(QATAR)",
    "McDONALD'S\nKSA", "AL-FAISALIAH\nGROUP",
    "KITOPI", "VERITUX"
  ),
  role = c(
    "Audit Manager", "AVP, Internal Audit",
    "Internal Audit Manager", "Manager, Internal Audit",
    "Group Director, IA & Risk", "Director of Internal Audit",
    "Internal Audit Director"
  ),
  stringsAsFactors = FALSE
)

# ── X-axis ticks ──────────────────────────────────────────────────────────────
axis_years <- c(2005, 2008, 2011, 2014, 2017, 2020, 2023, 2026)

# ── Audit Committee point — interpolated on line between AFG and Kitopi ───────
# x=2021, y = 0.61 + (2021-2019)/(2023.5-2019) * (0.75-0.61)
ac_x <- 2021
ac_y <- 0.61 + (ac_x - 2019) / (2023.5 - 2019) * (0.75 - 0.61)  # ≈ 0.672

p <- ggplot() +

  # Vertical grid lines
  geom_vline(xintercept = axis_years,
             color = WHITE, alpha = 0.07, linewidth = 0.5) +

  # Career connecting line
  geom_line(data = career, aes(x = x, y = y),
            color = GOLD, linewidth = 2.3, lineend = "round") +

  # Glow rings
  geom_point(data = career, aes(x = x, y = y),
             color = GOLD, size = 9, alpha = 0.15) +

  # Milestone dots
  geom_point(data = career, aes(x = x, y = y),
             shape = 21, fill = GOLD, color = WHITE,
             size = 3.8, stroke = 1.3) +

  # Role labels above dots
  geom_text(data = career, aes(x = x, y = y + 0.058, label = role),
            color = WHITE, size = 2.35, hjust = 0.5, vjust = 0,
            lineheight = 0.9) +

  # Company labels below axis
  geom_text(data = career, aes(x = x, y = -0.06, label = company),
            color = GRAY, size = 1.95, hjust = 0.5,
            fontface = "bold", lineheight = 0.85) +

  # Year axis labels
  geom_text(data = data.frame(x = axis_years),
            aes(x = x, y = -0.11, label = x),
            color = GRAY, size = 2.2, hjust = 0.5) +

  # ── Audit Committee Member annotation ─────────────────────────────────────
  # Diamond on the line
  geom_point(data = data.frame(x = ac_x, y = ac_y),
             aes(x = x, y = y),
             shape = 18, color = GOLD, size = 3.5) +

  # Dashed connector going up-left
  geom_segment(aes(x = ac_x, xend = ac_x - 0.8,
                   y = ac_y, yend = ac_y + 0.12),
               color = GOLD, linewidth = 0.7, linetype = "dashed") +

  # AC label
  annotate("text",
           x = ac_x - 0.9, y = ac_y + 0.145,
           label = "Audit Committee Member\nAFG Restaurants Sector",
           color = GOLD, size = 1.95, hjust = 0.5, lineheight = 0.9) +

  # ── "Audit 4.0" badge ───────────────────────────────────────────────────
  annotate("text",
           x = 2025.5, y = 0.97,
           label = "AUDIT 4.0 & STRATEGIC ADVISORY",
           color = GOLD, size = 1.9, hjust = 0.5, fontface = "bold") +

  # ── Title ───────────────────────────────────────────────────────────────
  annotate("text",
           x = 2004, y = 1.04,
           label = "STRATEGIC CAREER ARCHITECTURE",
           color = WHITE, size = 5.8, hjust = 0, fontface = "bold") +

  # ── Subtitle ────────────────────────────────────────────────────────────
  annotate("text",
           x = 2004, y = 0.97,
           label = "TWO DECADES OF PROGRESSIVE LEADERSHIP & ENTERPRISE VALUE PROTECTION",
           color = GRAY, size = 2.1, hjust = 0) +

  scale_x_continuous(limits = c(2003.5, 2027.5)) +
  scale_y_continuous(limits = c(-0.15, 1.10)) +

  theme_void() +
  theme(
    plot.background  = element_rect(fill = BG, color = NA),
    panel.background = element_rect(fill = BG, color = NA),
    plot.margin      = margin(25, 40, 20, 40)
  )

ggsave(
  filename = "C:/Users/sorat/Desktop/Coding/portfolio_my/public/images/career/timeline.png",
  plot     = p,
  width    = 13,
  height   = 5,
  dpi      = 150,
  bg       = BG
)

message("timeline.png saved successfully.")
