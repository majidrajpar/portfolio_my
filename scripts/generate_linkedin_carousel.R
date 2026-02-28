# ══════════════════════════════════════════════════════════════════════════════
# LinkedIn Carousel: The Fintech Risk Stack
# 10 slides · 1080×1080 px · Navy/Gold brand
# ══════════════════════════════════════════════════════════════════════════════

library(ggplot2);   library(dplyr);      library(tibble)
library(patchwork); library(ggrepel);    library(treemapify)
library(ggalluvial);library(magick);     library(tidyr)
library(scales)

# ── Palette ───────────────────────────────────────────────────────────────────
NAVY   <- "#001F5B"; GOLD   <- "#C9A84C"; WHITE  <- "#FFFFFF"
SLATE  <- "#475569"; LIGHT  <- "#94A3B8"; BG     <- "#F8FAFC"
RED    <- "#DC2626"; GREEN  <- "#16A34A"; AMBER  <- "#D97706"
BLUE   <- "#1D4ED8"; PURPLE <- "#7C3AED"; TEAL   <- "#0D9488"
NAVY2  <- "#0F2F6E"   # slightly lighter navy for gradients

# ── Output ────────────────────────────────────────────────────────────────────
OUT <- "C:/Users/sorat/Desktop/fintech_carousel"
dir.create(OUT, showWarnings = FALSE)
AUTHOR <- "Majid Rajpar  |  Internal Audit & Fintech Risk"

# ── Shared content theme ──────────────────────────────────────────────────────
CT <- theme_minimal(base_family = "sans") +
  theme(
    plot.background  = element_rect(fill = WHITE, colour = NA),
    panel.background = element_rect(fill = WHITE, colour = NA),
    panel.grid.major = element_line(colour = "#E2E8F0", linewidth = .28),
    panel.grid.minor = element_blank(),
    axis.text        = element_text(size = 7.5, colour = SLATE),
    axis.title       = element_text(size = 7.5, colour = SLATE, face = "bold"),
    plot.margin      = margin(6, 14, 6, 14),
    legend.text      = element_text(size = 7,   colour = SLATE),
    legend.title     = element_text(size = 7.5, colour = SLATE, face = "bold"),
    legend.key.size  = unit(0.32, "cm"),
    legend.margin    = margin(0, 0, 0, 0),
    legend.box.margin= margin(-4, 0, 0, 0)
  )

# ── Slide chrome helpers ──────────────────────────────────────────────────────
make_header <- function(title, tag = NULL, title_size = 4.2) {
  p <- ggplot() + theme_void() +
    theme(plot.background = element_rect(fill = NAVY, colour = NA),
          plot.margin = margin(0,0,0,0)) +
    annotate("rect", xmin = 0, xmax = 0.18, ymin = 0.88, ymax = 0.97,
             fill = GOLD) +
    annotate("text", x = 0.06, y = 0.55, label = title,
             colour = WHITE, size = title_size, fontface = "bold",
             hjust = 0, family = "sans") +
    xlim(0, 1) + ylim(0, 1)
  if (!is.null(tag))
    p <- p + annotate("text", x = 0.06, y = 0.15, label = tag,
                      colour = GOLD, size = 2.7, hjust = 0, family = "sans")
  p
}

make_footer <- function(n, tag_right = NULL) {
  label_r <- if (!is.null(tag_right)) tag_right else paste0(n, " / 10")
  ggplot() + theme_void() +
    theme(plot.background = element_rect(fill = "#EEF2FB", colour = NA),
          plot.margin = margin(0,0,0,0)) +
    annotate("text", x = 0.04, y = 0.5, label = AUTHOR,
             colour = SLATE, size = 2.1, hjust = 0, family = "sans") +
    annotate("text", x = 0.96, y = 0.5, label = label_r,
             colour = NAVY, size = 2.3, hjust = 1,
             fontface = "bold", family = "sans") +
    xlim(0, 1) + ylim(0, 1)
}

wrap_slide <- function(main, title, tag = NULL, n, title_size = 4.2) {
  make_header(title, tag, title_size) / main / make_footer(n) +
    plot_layout(heights = c(0.13, 0.81, 0.06))
}

save_slide <- function(p, fname) {
  ggsave(file.path(OUT, fname), p,
         width = 6, height = 6, dpi = 180, bg = WHITE)
  message(fname, " saved")
}

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — Cover
# ══════════════════════════════════════════════════════════════════════════════
s1 <- ggplot() + theme_void() +
  theme(plot.background = element_rect(fill = NAVY, colour = NA)) +
  # Gold accent bar
  annotate("rect",  xmin=0, xmax=1, ymin=0.895, ymax=0.91, fill=GOLD) +
  # Eyebrow
  annotate("text",  x=0.07, y=0.84, hjust=0, family="sans",
           label="FINTECH RISK INTELLIGENCE",
           colour=GOLD, size=2.6, fontface="bold") +
  # Main title
  annotate("text",  x=0.07, y=0.70, hjust=0, family="sans", lineheight=0.95,
           label="The Fintech\nRisk Stack",
           colour=WHITE, size=11.5, fontface="bold") +
  # Subtitle
  annotate("text",  x=0.07, y=0.50, hjust=0, family="sans", lineheight=1.3,
           label="8 product risks that most frameworks\nunderestimate — and why it matters",
           colour=LIGHT, size=3.8) +
  # Divider
  annotate("segment", x=0.07, xend=0.93, y=0.42, yend=0.42,
           colour="#1E3A6E", linewidth=0.8) +
  # Risk pill labels
  annotate("text", x=0.07, y=0.36, hjust=0, family="sans",
           label="MODEL RISK  ·  EMBEDDED FINANCE  ·  REGULATORY FRAGMENTATION",
           colour="#64748B", size=2.3) +
  annotate("text", x=0.07, y=0.30, hjust=0, family="sans",
           label="CONCENTRATION RISK  ·  DATA GOVERNANCE  ·  CYBER EXPOSURE",
           colour="#64748B", size=2.3) +
  annotate("text", x=0.07, y=0.24, hjust=0, family="sans",
           label="OPERATIONAL RESILIENCE  ·  CREDIT MODEL DRIFT",
           colour="#64748B", size=2.3) +
  # Footer rule
  annotate("rect",  xmin=0, xmax=1, ymin=0.09, ymax=0.10, fill="#0A1F4A") +
  annotate("text",  x=0.07, y=0.055, hjust=0, family="sans",
           label=AUTHOR,  colour=LIGHT, size=2.4) +
  annotate("text",  x=0.93, y=0.055, hjust=1, family="sans",
           label="Swipe to explore  →", colour=GOLD, size=2.7, fontface="bold") +
  xlim(0,1) + ylim(0,1)

save_slide(s1, "s01_cover.png")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — Risk Landscape: Visibility vs Severity
# ══════════════════════════════════════════════════════════════════════════════
risks <- tibble(
  risk       = c("Credit &\nFraud","Model\nRisk","Operational\nResilience",
                 "Embedded\nFinance","Regulatory\nFragmentation",
                 "Data &\nPrivacy","Concentration\nRisk","Cyber &\nInfoSec"),
  detect     = c(4.1, 1.5, 2.3, 1.7, 3.3, 3.6, 1.4, 2.9),
  severity   = c(3.8, 4.7, 4.3, 4.9, 4.0, 4.2, 4.5, 4.8),
  freq       = c(55,  22,  38,  18,  32,  44,  16,  40),
  domain     = c("Financial","Analytical","Operational","Strategic",
                 "Compliance","Compliance","Operational","Technical")
)

dom_cols <- c(Financial="red3", Analytical=NAVY, Operational=AMBER,
              Strategic=BLUE,   Compliance=TEAL,  Technical=PURPLE)

s2_main <- ggplot(risks, aes(x=detect, y=severity)) +
  # Blind-spot zone
  annotate("rect", xmin=0.8, xmax=2.8, ymin=4.3, ymax=5.15,
           fill="#FEE2E2", alpha=0.55) +
  annotate("text", x=0.88, y=5.07, label="▲  BLIND SPOT ZONE",
           colour=RED, size=2.3, hjust=0, fontface="bold", family="sans") +
  # Quadrant lines
  geom_vline(xintercept=3, linetype="dashed", colour=LIGHT, linewidth=0.4) +
  geom_hline(yintercept=4.25, linetype="dashed", colour=LIGHT, linewidth=0.4) +
  # Quadrant labels
  annotate("text", x=3.3, y=3.60, label="Visible & Managed",
           colour=LIGHT, size=2.1, fontface="italic", family="sans") +
  annotate("text", x=4.6, y=5.08, label="Visible & Severe",
           colour=SLATE, size=2.1, fontface="italic", family="sans") +
  # Bubbles
  geom_point(aes(size=freq, fill=domain),
             shape=21, colour=WHITE, stroke=1.3, alpha=0.90) +
  geom_text_repel(aes(label=risk, colour=domain),
                  size=2.25, fontface="bold", lineheight=0.9,
                  max.overlaps=15, box.padding=0.45,
                  segment.size=0.3, segment.alpha=0.5, family="sans") +
  scale_fill_manual(values=dom_cols, guide="none") +
  scale_colour_manual(values=dom_cols, guide="none") +
  scale_size_continuous(range=c(5,17), guide="none") +
  scale_x_continuous(limits=c(0.6, 5.3),
                     breaks=c(1.5, 3, 4.5),
                     labels=c("Hard to detect","Moderate","Easy to detect")) +
  scale_y_continuous(limits=c(3.5, 5.2),
                     breaks=c(3.75, 4.25, 4.75),
                     labels=c("Moderate","High","Critical")) +
  CT + theme(panel.grid=element_blank()) +
  labs(x="← Detection Difficulty →", y="← Severity / Impact →")

save_slide(
  wrap_slide(s2_main,
             "The Fintech Risk Landscape",
             "Bubble size = frequency of occurrence · Red zone = high severity + hard to detect",
             n=2),
  "s02_risk_landscape.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — Model Risk: Credit Score Drift
# ══════════════════════════════════════════════════════════════════════════════
model_df <- tibble(
  month = 1:24,
  auc   = c(0.822,0.819,0.817,0.814,0.812,0.809,0.805,0.800,0.795,
            0.788,0.780,0.771,0.761,0.750,0.739,0.727,0.714,0.700,
            0.685,0.669,0.652,0.634,0.615,0.595),
  phase = c(rep("Stable",6), rep("Drift",8), rep("Degraded",10))
) %>% mutate(phase=factor(phase, levels=c("Stable","Drift","Degraded")))

phase_cols <- c(Stable=GREEN, Drift=AMBER, Degraded=RED)

s3_main <- ggplot(model_df, aes(x=month, y=auc)) +
  # Phase bands
  annotate("rect", xmin=0.5, xmax=6.5,  ymin=0.57, ymax=0.84, fill=GREEN,  alpha=0.06) +
  annotate("rect", xmin=6.5, xmax=14.5, ymin=0.57, ymax=0.84, fill=AMBER,  alpha=0.07) +
  annotate("rect", xmin=14.5,xmax=24.5, ymin=0.57, ymax=0.84, fill=RED,    alpha=0.07) +
  # Phase labels
  annotate("text", x=3.5,  y=0.834, label="STABLE",    colour=GREEN, size=2.3, fontface="bold", family="sans") +
  annotate("text", x=10.5, y=0.834, label="DRIFT",     colour=AMBER, size=2.3, fontface="bold", family="sans") +
  annotate("text", x=19.5, y=0.834, label="DEGRADED",  colour=RED,   size=2.3, fontface="bold", family="sans") +
  # Regulatory threshold
  geom_hline(yintercept=0.72, linetype="dashed", colour=NAVY, linewidth=0.7) +
  annotate("text", x=0.8, y=0.728, label="Regulatory minimum (AUC 0.72)",
           colour=NAVY, size=2.1, hjust=0, fontface="bold", family="sans") +
  # Performance line
  geom_area(aes(fill=phase), alpha=0.18, show.legend=FALSE) +
  geom_line(aes(colour=phase), linewidth=1.4, show.legend=FALSE) +
  geom_point(data=filter(model_df, month %in% c(1,6,12,18,24)),
             aes(colour=phase), size=3, shape=21, fill=WHITE, stroke=1.8) +
  # Key event annotations
  annotate("text", x=14.2, y=0.768, label="← Concept drift\ndetected",
           colour=AMBER, size=2.0, hjust=1, lineheight=0.9, fontface="bold", family="sans") +
  annotate("segment", x=14.5, xend=14.5, y=0.595, yend=0.752,
           colour=RED, linewidth=0.5, linetype="dotted") +
  annotate("text", x=14.8, y=0.625, label="Model review\ntriggered",
           colour=RED, size=2.0, hjust=0, lineheight=0.9, family="sans") +
  scale_colour_manual(values=phase_cols, guide="none") +
  scale_fill_manual(values=phase_cols, guide="none") +
  scale_x_continuous(breaks=c(1,6,12,18,24),
                     labels=c("M1","M6","M12","M18","M24")) +
  scale_y_continuous(limits=c(0.57,0.848), breaks=seq(0.60,0.82,0.06),
                     labels=scales::number_format(accuracy=0.01)) +
  CT +
  labs(x="Months Post-Deployment", y="Model Discriminatory Power (AUC)")

save_slide(
  wrap_slide(s3_main,
             "Model Risk: The Silent Performance Decay",
             "Credit scoring model AUC over 24 months · SR 11-7 / equivalent MRM standards apply",
             n=3),
  "s03_model_risk.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — Regulatory Fragmentation Heatmap
# ══════════════════════════════════════════════════════════════════════════════
reg_raw <- list(
  UAE  = c(BNPL=3, Crypto=4, Neobank=4, Payments=4, Lending=3, InsurTech=3),
  KSA  = c(BNPL=4, Crypto=5, Neobank=4, Payments=4, Lending=4, InsurTech=3),
  UK   = c(BNPL=5, Crypto=4, Neobank=5, Payments=5, Lending=4, InsurTech=4),
  EU   = c(BNPL=5, Crypto=4, Neobank=5, Payments=5, Lending=5, InsurTech=5),
  US   = c(BNPL=4, Crypto=5, Neobank=4, Payments=4, Lending=5, InsurTech=4),
  SG   = c(BNPL=3, Crypto=3, Neobank=4, Payments=4, Lending=3, InsurTech=3)
)
reg_df <- bind_rows(lapply(names(reg_raw), function(r)
  tibble(region=r, product=names(reg_raw[[r]]), burden=reg_raw[[r]])
)) %>%
  mutate(
    product = factor(product,
                     levels=c("InsurTech","Lending","Payments","Neobank","Crypto","BNPL")),
    region  = factor(region, levels=c("SG","US","EU","UK","KSA","UAE")),
    label   = case_when(burden==5~"Severe", burden==4~"High",
                        burden==3~"Medium", TRUE~"Low")
  )

s4_main <- ggplot(reg_df, aes(x=region, y=product, fill=burden)) +
  geom_tile(colour=WHITE, linewidth=1.2, width=0.92, height=0.92) +
  geom_text(aes(label=label, colour=burden >= 4),
            size=2.4, fontface="bold", family="sans") +
  scale_fill_gradient2(low="#DCFCE7", mid="#FEF3C7", high=RED,
                       midpoint=3.5, limits=c(1,5),
                       name="Regulatory\nBurden", guide="none") +
  scale_colour_manual(values=c("FALSE"=SLATE, "TRUE"=WHITE), guide="none") +
  scale_x_discrete(position="top") +
  CT +
  theme(panel.grid=element_blank(),
        axis.text.x=element_text(size=8.5, colour=NAVY, face="bold"),
        axis.text.y=element_text(size=8.5, colour=SLATE)) +
  labs(x=NULL, y=NULL)

save_slide(
  wrap_slide(s4_main,
             "Regulatory Fragmentation Across Markets",
             "Same product · 6 jurisdictions · entirely different risk profile",
             n=4),
  "s04_regulatory_heatmap.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — Embedded Finance Risk Amplification
# ══════════════════════════════════════════════════════════════════════════════
layers <- tibble(
  layer     = factor(
    c("End Consumer","Fintech App","BaaS Platform","Banking Sponsor","Regulator"),
    levels=rev(c("End Consumer","Fintech App","BaaS Platform","Banking Sponsor","Regulator"))
  ),
  risk_exp  = c(1.0, 2.4, 3.9, 5.2, 6.8),
  liability = c(0.2, 1.8, 4.5, 6.0, 8.5),
  visibility= c(4.8, 3.5, 2.2, 1.5, 1.0)
)

s5_main <- ggplot(layers) +
  # Background bands
  geom_col(aes(y=layer, x=liability),
           fill="#EFF3FB", width=0.72) +
  geom_col(aes(y=layer, x=risk_exp, fill=layer),
           width=0.72, alpha=0.9) +
  # Labels
  geom_text(aes(y=layer, x=risk_exp + 0.1,
                label=paste0(risk_exp, "×  exposure")),
            hjust=0, size=2.8, fontface="bold", colour=NAVY, family="sans") +
  scale_fill_manual(
    values=c("End Consumer"=GREEN, "Fintech App"=TEAL,
             "BaaS Platform"=BLUE, "Banking Sponsor"=NAVY, "Regulator"=NAVY2),
    guide="none"
  ) +
  scale_x_continuous(limits=c(0, 10.5), breaks=seq(0,8,2)) +
  geom_vline(xintercept=0, colour=NAVY, linewidth=0.5) +
  CT +
  theme(panel.grid.major.y=element_blank(),
        axis.text.y=element_text(size=8.5, colour=NAVY, face="bold")) +
  labs(x="Risk Exposure Multiplier (relative to direct consumer risk)",
       y=NULL,
       caption="Grey bars = legal/contractual liability · Coloured = actual risk exposure absorbed per layer")

save_slide(
  wrap_slide(s5_main,
             "Embedded Finance: Risk Doesn't Disappear — It Migrates",
             "BaaS and sponsor bank models amplify risk 6× by the time it reaches the regulator",
             n=5, title_size=3.5),
  "s05_embedded_finance.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — Concentration Risk Treemap
# ══════════════════════════════════════════════════════════════════════════════
conc <- tibble(
  category = c(rep("Cloud",3), rep("Payments",3),
               rep("Open Banking",2), rep("Identity/KYC",2), rep("Core Banking",2)),
  vendor   = c("AWS","Azure","GCP",
               "Stripe","Adyen","Checkout.com",
               "Plaid","TrueLayer",
               "Jumio","Onfido",
               "Mambu","Thought Machine"),
  share    = c(32,17,7,  23,12,7,  16,9,  14,8,  8,6),
  critical = c("Critical","Critical","Monitored",
               "Critical","Critical","Monitored",
               "Critical","Monitored",
               "Critical","Monitored",
               "Critical","Monitored")
)

crit_cols <- c(Critical="#DC2626", Monitored=NAVY)

s6_main <- ggplot(conc,
  aes(area=share, fill=critical, subgroup=category,
      label=paste0(vendor,"\n",share,"%"))) +
  geom_treemap(colour=WHITE, size=2) +
  geom_treemap_subgroup_border(colour=WHITE, size=4) +
  geom_treemap_subgroup_text(
    colour=WHITE, alpha=0.4, place="topleft",
    fontface="bold", size=8, family="sans", grow=FALSE
  ) +
  geom_treemap_text(
    colour=WHITE, place="centre", fontface="bold",
    size=8, grow=FALSE, reflow=TRUE, family="sans"
  ) +
  scale_fill_manual(
    values=crit_cols,
    name="Dependency",
    labels=c("Critical — single point of failure", "Monitored — alternative exists")
  ) +
  CT + theme(panel.grid=element_blank(),
             axis.text=element_blank(),
             legend.position="bottom") +
  labs(caption="Area = % of critical infrastructure path · Critical = no viable short-term substitute")

save_slide(
  wrap_slide(s6_main,
             "Concentration Risk: 3 Vendors Run Your Fintech",
             "The dependency map most boards have never seen",
             n=6),
  "s06_concentration_risk.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — Operational Resilience: The Expectation Gap
# ══════════════════════════════════════════════════════════════════════════════
resilience <- tibble(
  regulator   = factor(
    c("FCA (UK)","ECB / EBA","SAMA (KSA)","CBUAE","MAS (SG)","OCC (US)"),
    levels=rev(c("FCA (UK)","ECB / EBA","SAMA (KSA)","CBUAE","MAS (SG)","OCC (US)"))
  ),
  required    = c(4,  2,  4,  8,  4,  4),
  typical_sla = c(8, 12, 12, 24,  8,  8),
  gap         = c(4, 10,  8, 16,  4,  4)
)

s7_main <- ggplot(resilience) +
  # Connector
  geom_segment(aes(y=regulator, yend=regulator,
                   x=required, xend=typical_sla),
               colour="#CBD5E1", linewidth=4) +
  # Regulatory requirement (left dot = better)
  geom_point(aes(y=regulator, x=required),
             colour=GREEN, size=5.5) +
  # Vendor SLA (right dot = worse)
  geom_point(aes(y=regulator, x=typical_sla),
             colour=RED, size=5.5) +
  # Gap labels
  geom_text(aes(y=regulator,
                x=(required + typical_sla)/2,
                label=paste0("+",gap,"h gap")),
            vjust=-1.1, size=2.5, colour=SLATE, fontface="bold", family="sans") +
  # Value labels
  geom_text(aes(y=regulator, x=required,
                label=paste0(required,"h")),
            colour=WHITE, size=2.3, fontface="bold", family="sans") +
  geom_text(aes(y=regulator, x=typical_sla,
                label=paste0(typical_sla,"h")),
            colour=WHITE, size=2.3, fontface="bold", family="sans") +
  # Legend annotation
  annotate("point", x=19, y="FCA (UK)", colour=GREEN, size=4) +
  annotate("text",  x=20, y="FCA (UK)", label="Regulatory RTO",
           colour=GREEN, size=2.4, hjust=0, fontface="bold", family="sans") +
  annotate("point", x=19, y="SAMA (KSA)", colour=RED, size=4) +
  annotate("text",  x=20, y="SAMA (KSA)", label="Typical vendor SLA",
           colour=RED, size=2.4, hjust=0, fontface="bold", family="sans") +
  scale_x_continuous(limits=c(0, 32), breaks=c(0,4,8,12,16,20,24),
                     labels=paste0(c(0,4,8,12,16,20,24),"h")) +
  CT + theme(panel.grid.major.y=element_blank()) +
  labs(x="Recovery Time Objective (hours — lower is better)", y=NULL,
       caption="RTO = maximum acceptable downtime · Source: public regulatory guidance & SLA benchmarks")

save_slide(
  wrap_slide(s7_main,
             "Operational Resilience: The SLA Illusion",
             "Regulators demand faster recovery than most vendor contracts actually guarantee",
             n=7),
  "s07_resilience_gap.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — Risk Interaction: Compound Severity Matrix
# ══════════════════════════════════════════════════════════════════════════════
risk_names <- c("Model\nFailure","Data\nBreach","Regulatory\nChange",
                "Cloud\nOutage","Fraud\nSpike")

interact <- tribble(
  ~r_a,              ~r_b,              ~score, ~label,
  "Model\nFailure",  "Data\nBreach",    8.2,  "8.2",
  "Model\nFailure",  "Regulatory\nChange", 7.1, "7.1",
  "Model\nFailure",  "Cloud\nOutage",   6.8,  "6.8",
  "Model\nFailure",  "Fraud\nSpike",    9.1,  "9.1",
  "Data\nBreach",    "Regulatory\nChange", 8.7, "8.7",
  "Data\nBreach",    "Cloud\nOutage",   6.2,  "6.2",
  "Data\nBreach",    "Fraud\nSpike",    7.4,  "7.4",
  "Regulatory\nChange","Cloud\nOutage", 5.3,  "5.3",
  "Regulatory\nChange","Fraud\nSpike",  6.1,  "6.1",
  "Cloud\nOutage",   "Fraud\nSpike",    8.4,  "8.4"
) %>%
  # Mirror for full matrix
  bind_rows(rename(., r_a=r_b, r_b=r_a)) %>%
  # Diagonal
  bind_rows(tibble(r_a=risk_names, r_b=risk_names, score=NA_real_, label="—")) %>%
  mutate(
    r_a = factor(r_a, levels=risk_names),
    r_b = factor(r_b, levels=rev(risk_names))
  )

s8_main <- ggplot(interact, aes(x=r_a, y=r_b, fill=score)) +
  geom_tile(colour=WHITE, linewidth=1.0, width=0.94, height=0.94) +
  geom_text(aes(label=label, colour=score >= 8),
            size=3.0, fontface="bold", family="sans") +
  scale_fill_gradient2(
    low="#DCFCE7", mid="#FEF3C7", high=RED,
    midpoint=6.5, limits=c(4,10), na.value="#F1F5F9",
    name="Compound\nSeverity (1–10)", guide="none"
  ) +
  scale_colour_manual(values=c("FALSE"=SLATE,"TRUE"=WHITE), guide="none") +
  CT + theme(
    panel.grid=element_blank(),
    axis.text.x=element_text(size=7.5, lineheight=0.9),
    axis.text.y=element_text(size=7.5, lineheight=0.9)
  ) +
  labs(x=NULL, y=NULL,
       caption="Compound severity when both risks materialise simultaneously · Diagonal = single-risk baseline")

save_slide(
  wrap_slide(s8_main,
             "Compound Risk: Risks Multiply, They Don't Add",
             "The most dangerous scenarios live at the intersections",
             n=8),
  "s08_compound_risk.png"
)

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 9 — Three Questions for Your Risk Team
# ══════════════════════════════════════════════════════════════════════════════
s9 <- ggplot() + theme_void() +
  theme(plot.background = element_rect(fill = WHITE, colour = NA)) +
  # Header band
  annotate("rect", xmin=0, xmax=1, ymin=0.88, ymax=1.0, fill=NAVY) +
  annotate("rect", xmin=0, xmax=0.22, ymin=0.93, ymax=0.985, fill=GOLD) +
  annotate("text", x=0.06, y=0.915, hjust=0, family="sans",
           label="3 Questions to Ask Your Risk Team — Today",
           colour=WHITE, size=4.6, fontface="bold") +
  # Q1
  annotate("rect", xmin=0.06, xmax=0.11, ymin=0.770, ymax=0.842, fill=RED, alpha=0.9) +
  annotate("text", x=0.085, y=0.806, label="1", colour=WHITE, size=5.5, fontface="bold", family="sans") +
  annotate("text", x=0.145, y=0.836, hjust=0, family="sans",
           label="When did you last validate your credit models?",
           colour=NAVY, size=3.5, fontface="bold") +
  annotate("text", x=0.145, y=0.785, hjust=0, family="sans", lineheight=1.2,
           label="SR 11-7 and equivalent standards require ongoing monitoring.\nMost fintechs validate annually at best — models drift monthly.",
           colour=SLATE, size=2.7) +
  # Q2
  annotate("rect", xmin=0.06, xmax=0.11, ymin=0.580, ymax=0.652, fill=AMBER, alpha=0.9) +
  annotate("text", x=0.085, y=0.616, label="2", colour=WHITE, size=5.5, fontface="bold", family="sans") +
  annotate("text", x=0.145, y=0.646, hjust=0, family="sans",
           label="Can you map your critical data flows end-to-end?",
           colour=NAVY, size=3.5, fontface="bold") +
  annotate("text", x=0.145, y=0.595, hjust=0, family="sans", lineheight=1.2,
           label="PDPL, GDPR, and PSD2 require it. Most fintechs discover\nthird-party data sharing only after a breach notification.",
           colour=SLATE, size=2.7) +
  # Q3
  annotate("rect", xmin=0.06, xmax=0.11, ymin=0.390, ymax=0.462, fill=NAVY, alpha=0.9) +
  annotate("text", x=0.085, y=0.426, label="3", colour=WHITE, size=5.5, fontface="bold", family="sans") +
  annotate("text", x=0.145, y=0.456, hjust=0, family="sans",
           label="What's your embedded finance risk appetite — in writing?",
           colour=NAVY, size=3.5, fontface="bold") +
  annotate("text", x=0.145, y=0.405, hjust=0, family="sans", lineheight=1.2,
           label="BaaS and sponsor bank relationships transfer liability\nin ways most product teams haven't stress-tested.",
           colour=SLATE, size=2.7) +
  # Divider
  annotate("segment", x=0.06, xend=0.94, y=0.355, yend=0.355,
           colour="#E2E8F0", linewidth=0.8) +
  # Insight callout
  annotate("text", x=0.06, y=0.305, hjust=0, family="sans",
           label="Most fintech risk frameworks are built for",
           colour=SLATE, size=3.1) +
  annotate("text", x=0.06, y=0.255, hjust=0, family="sans",
           label="individual risks — not compound failures.",
           colour=NAVY, size=3.6, fontface="bold") +
  # Footer
  annotate("rect", xmin=0, xmax=1, ymin=0, ymax=0.10, fill="#EEF2FB") +
  annotate("text", x=0.06, y=0.05, hjust=0, family="sans",
           label=AUTHOR, colour=SLATE, size=2.2) +
  annotate("text", x=0.94, y=0.05, hjust=1, family="sans",
           label="9 / 10", colour=NAVY, size=2.4, fontface="bold") +
  xlim(0,1) + ylim(0,1)

save_slide(s9, "s09_questions.png")

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 10 — Close / CTA
# ══════════════════════════════════════════════════════════════════════════════
s10 <- ggplot() + theme_void() +
  theme(plot.background = element_rect(fill = NAVY, colour = NA)) +
  # Gold top bar
  annotate("rect", xmin=0, xmax=1, ymin=0.895, ymax=0.910, fill=GOLD) +
  # Headline
  annotate("text", x=0.07, y=0.805, hjust=0, family="sans", lineheight=1.0,
           label="Risk isn't a\ndepartment.",
           colour=WHITE, size=10, fontface="bold") +
  annotate("text", x=0.07, y=0.615, hjust=0, family="sans", lineheight=1.0,
           label="It's a product\nfeature.",
           colour=GOLD, size=10, fontface="bold") +
  # Divider
  annotate("segment", x=0.07, xend=0.93, y=0.515, yend=0.515,
           colour="#1E3A6E", linewidth=0.6) +
  # Summary bullets
  annotate("text", x=0.07, y=0.462, hjust=0, family="sans",
           label="→  Model risk degrades silently — validate quarterly, not annually",
           colour=LIGHT, size=2.7) +
  annotate("text", x=0.07, y=0.412, hjust=0, family="sans",
           label="→  Embedded finance multiplies risk exposure 6× across layers",
           colour=LIGHT, size=2.7) +
  annotate("text", x=0.07, y=0.362, hjust=0, family="sans",
           label="→  Most vendor SLAs don't meet regulatory resilience thresholds",
           colour=LIGHT, size=2.7) +
  annotate("text", x=0.07, y=0.312, hjust=0, family="sans",
           label="→  Risk compound effects are exponential, not additive",
           colour=LIGHT, size=2.7) +
  # Divider
  annotate("segment", x=0.07, xend=0.93, y=0.268, yend=0.268,
           colour="#1E3A6E", linewidth=0.4) +
  # CTA
  annotate("text", x=0.07, y=0.218, hjust=0, family="sans",
           label="Found this useful? Follow for more on audit, risk & fintech.",
           colour="#94A3B8", size=2.8) +
  annotate("text", x=0.07, y=0.158, hjust=0, family="sans",
           label="What risk does your team underestimate most? Comment below.",
           colour=GOLD, size=2.9, fontface="bold") +
  # Author
  annotate("rect", xmin=0, xmax=1, ymin=0, ymax=0.09, fill="#0A1F4A") +
  annotate("text", x=0.07, y=0.046, hjust=0, family="sans",
           label=AUTHOR, colour=LIGHT, size=2.5) +
  annotate("text", x=0.93, y=0.046, hjust=1, family="sans",
           label="10 / 10", colour=GOLD, size=2.5, fontface="bold") +
  xlim(0,1) + ylim(0,1)

save_slide(s10, "s10_close.png")

# ══════════════════════════════════════════════════════════════════════════════
# COMBINE all PNGs → single PDF
# ══════════════════════════════════════════════════════════════════════════════
message("\nCombining slides into PDF...")
slides <- file.path(OUT, sprintf("s%02d_%s.png",
  1:10,
  c("cover","risk_landscape","model_risk","regulatory_heatmap",
    "embedded_finance","concentration_risk","resilience_gap",
    "compound_risk","questions","close")
))

imgs <- image_read(slides)
pdf_path <- "C:/Users/sorat/Desktop/fintech_risk_carousel.pdf"
image_write(image_convert(imgs, "pdf"), path=pdf_path, format="pdf")

message("\n✓ Carousel PDF: ", pdf_path)
message("✓ Individual PNGs in: ", OUT)
message("✓ 10 slides · 1080×1080 px · ready for LinkedIn upload")
