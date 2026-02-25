library(ggplot2)

BG    <- "#001F5B"
GOLD  <- "#C9A84C"
WHITE <- "#FFFFFF"
GRAY  <- "#8895AA"
DIM   <- "#5A6A80"   # dimmer grey for date ranges

# ── Career milestones ─────────────────────────────────────────────────────────
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
  dates = c(
    "2004–2009", "2010–2011", "2011–2013",
    "2014–2016", "2016–2022", "2022–2025", "2025–Present"
  ),
  stringsAsFactors = FALSE
)

# ── X-axis ticks ──────────────────────────────────────────────────────────────
axis_years <- c(2005, 2008, 2011, 2014, 2017, 2020, 2023, 2026)

# ── Audit Committee point — interpolated on line between AFG and Kitopi ───────
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
            color = WHITE, size = 2.45, hjust = 0.5, vjust = 0,
            lineheight = 0.9) +

  # Company names below axis
  geom_text(data = career, aes(x = x, y = -0.055, label = company),
            color = GRAY, size = 2.0, hjust = 0.5,
            fontface = "bold", lineheight = 0.85) +

  # Date ranges below company names
  geom_text(data = career, aes(x = x, y = -0.095, label = dates),
            color = DIM, size = 1.8, hjust = 0.5) +

  # Year axis labels
  geom_text(data = data.frame(x = axis_years),
            aes(x = x, y = -0.135, label = x),
            color = GRAY, size = 2.2, hjust = 0.5) +

  # ── Audit Committee Member annotation ─────────────────────────────────────
  # Diamond on the line
  geom_point(data = data.frame(x = ac_x, y = ac_y),
             aes(x = x, y = y),
             shape = 18, color = GOLD, size = 3.5) +

  # Connector — straight up (avoids crowding "Group Director" label to the left)
  geom_segment(aes(x = ac_x, xend = ac_x,
                   y = ac_y + 0.015, yend = ac_y + 0.115),
               color = GOLD, linewidth = 0.7, linetype = "dashed") +

  # AC label — centred above connector
  annotate("text",
           x = ac_x, y = ac_y + 0.135,
           label = "Audit Committee Member\nAFG Restaurants Sector",
           color = GOLD, size = 2.0, hjust = 0.5, lineheight = 0.9) +

  # ── "Audit 4.0" badge — shifted left to avoid Veritux role label ──────────
  # Veritux role label sits at y ≈ 0.87 + 0.058 = 0.928; badge at y=0.965
  # with x=2024.5 gives clear horizontal separation from Veritux dot at x=2026
  annotate("text",
           x = 2024.5, y = 0.965,
           label = "AUDIT 4.0 & STRATEGIC ADVISORY",
           color = GOLD, size = 1.95, hjust = 0.5, fontface = "bold") +

  # ── Title — more top breathing room ──────────────────────────────────────
  annotate("text",
           x = 2004, y = 1.08,
           label = "STRATEGIC CAREER ARCHITECTURE",
           color = WHITE, size = 5.8, hjust = 0, fontface = "bold") +

  # ── Subtitle ─────────────────────────────────────────────────────────────
  annotate("text",
           x = 2004, y = 1.01,
           label = "TWO DECADES OF PROGRESSIVE LEADERSHIP & ENTERPRISE VALUE PROTECTION",
           color = GRAY, size = 2.1, hjust = 0) +

  scale_x_continuous(limits = c(2003.5, 2027.5)) +
  scale_y_continuous(limits = c(-0.20, 1.16)) +

  theme_void() +
  theme(
    plot.background  = element_rect(fill = BG, color = NA),
    panel.background = element_rect(fill = BG, color = NA),
    plot.margin      = margin(30, 45, 25, 45)
  )

ggsave(
  filename = "C:/Users/sorat/Desktop/Coding/portfolio_my/public/images/career/timeline.png",
  plot     = p,
  width    = 13,
  height   = 5.3,
  dpi      = 150,
  bg       = BG
)

message("timeline.png saved successfully.")
