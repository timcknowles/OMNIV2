# CLAUDE.md — CRRT Dose Calculator (OMNIV2)

## Project overview
A clinical decision support PWA for CRRT (Continuous Renal Replacement Therapy) dose selection, covering both Regional Citrate Anticoagulation (RCA/Citrate) and Heparin protocols. Deployed at:
**https://timcknowles.github.io/OMNIV2**

Repo: `github.com/timcknowles/OMNIV2`
Owner: Tim Knowles (@timcknowles)
Trust: Barts Health NHS Trust · Adult Critical Care Unit · Royal London Hospital

---

## File structure
```
OMNIV2/
├── index.html                  # Single-page app — all UI, logic, and modals
├── sw.js                       # Service worker — offline caching, version reporting
├── manifest.json               # PWA manifest — icons, display, start_url
├── icon-192.svg                # App icon (SVG)
├── icon-512.svg                # App icon (SVG, duplicate for manifest)
├── CLAUDE.md                   # This file
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions — auto-deploy on push to main
```

---

## Tech stack
- Vanilla HTML/CSS/JS — no framework, no build step
- PWA: service worker (network-first) + web app manifest
- Hosted on GitHub Pages via GitHub Actions (Source: GitHub Actions, not branch)
- Fonts: DM Sans + DM Mono via Google Fonts
- Deployment: automatic on git push to main

---

## App flow
```
Step 1: Ideal Body Weight    → < 65 kg  |  >= 65 kg
Step 2: Protocol             → Citrate (RCA)  |  Heparin (CVVHD)
Step 3: Arterial pH          → protocol-specific ranges (see below)
Step 4: Serum K+ (mmol/L)   → 3x2 grid, ascending: <4, 4-4.5, 4.5-5, 5-5.5, 5.5-6, >6
Result: Q_D (dialysate flow mL/hr) + Q_B (blood flow mL/hr)
        + anticoagulation guide button (opens protocol-specific modal)
```

---

## Protocol differences

### Citrate (RCA)
- Blood flow (Q_B): variable — depends on weight AND pH
- pH ranges: 8 columns — <7.1, 7.10-7.19, 7.20-7.29, 7.30-7.39, 7.40-7.44, 7.45-7.49, 7.50-7.54, >7.55
- STOP zone: pH >7.55 (and some K+/pH combinations) — "STOP — Switch to Heparin"
- Bicarb alert: shown if pH < 7.20 — administer 50mL 8.4% bicarbonate over 30 min
- Dialysate: calcium-free with 4 mmol K+

### Heparin (CVVHD)
- Blood flow (Q_B): fixed at 150 mL/hr regardless of weight or pH
- pH ranges: 6 columns — <7.1, 7.1-7.19, 7.2-7.29, 7.3-7.39, 7.4-7.44, >7.45
- No STOP zone — table runs through all combinations
- Calcium dialysate alert: always shown when heparin protocol selected
- Dialysate: with calcium

---

## Dose tables

### Citrate — Blood Flow Q_B (mL/hr)
| Weight | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|--------|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| <65kg  | 130  | 120       | 110       | 100       | 80        | 80        | 80        | STOP  |
| >=65kg | 150  | 140       | 130       | 110       | 90        | 80        | 80        | STOP  |

### Citrate — Dialysate Q_D (mL/hr) · IBW < 65 kg
| K+     | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|--------|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| >6     | 2300 | 2300      | 2200      | 2200      | 2200      | 2300      | STOP      | STOP  |
| 5.5-6  | 2100 | 2100      | 2100      | 2000      | 1900      | 2100      | 2300      | STOP  |
| 5-5.5  | 1900 | 1900      | 1900      | 1800      | 1700      | 1900      | 2100      | STOP  |
| 4.5-5  | 1800 | 1700      | 1700      | 1600      | 1500      | 1900      | 2100      | STOP  |
| 4-4.5  | 1600 | 1500      | 1400      | 1400      | 1400      | 1700      | 2100      | STOP  |
| <4     | 1400 | 1400      | 1400      | 1400      | 1400      | 1700      | 2100      | STOP  |

### Citrate — Dialysate Q_D (mL/hr) · IBW >= 65 kg
| K+     | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|--------|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| >6     | 2700 | 2700      | 2600      | 2600      | 2600      | 2700      | STOP      | STOP  |
| 5.5-6  | 2500 | 2500      | 2500      | 2400      | 2300      | 2500      | 2700      | STOP  |
| 5-5.5  | 2300 | 2300      | 2300      | 2200      | 2100      | 2300      | 2500      | STOP  |
| 4.5-5  | 2200 | 2100      | 2100      | 2000      | 1900      | 2300      | 2500      | STOP  |
| 4-4.5  | 2000 | 1900      | 1800      | 1800      | 1800      | 2100      | 2500      | STOP  |
| <4     | 1800 | 1800      | 1800      | 1800      | 1800      | 2100      | 2500      | STOP  |

### Heparin — Blood Flow Q_B
Fixed at 150 mL/hr for all weight categories and pH values.

### Heparin — Dialysate Q_D (mL/hr) · IBW < 65 kg
| K+     | <7.1 | 7.1-7.19 | 7.2-7.29 | 7.3-7.39 | 7.4-7.44 | >7.45 |
|--------|------|----------|----------|----------|----------|-------|
| >6     | 2300 | 2300     | 2300     | 2300     | 2100     | 2100  |
| 5.5-6  | 2200 | 2200     | 2200     | 2000     | 1900     | 1900  |
| 5-5.5  | 2200 | 2000     | 1900     | 1800     | 1800     | 1700  |
| 4.5-5  | 2200 | 1800     | 1700     | 1500     | 1500     | 1500  |
| 4-4.5  | 2000 | 1700     | 1500     | 1500     | 1300     | 1300  |
| <4     | 2000 | 1700     | 1500     | 1300     | 1100     | 1100  |

### Heparin — Dialysate Q_D (mL/hr) · IBW >= 65 kg
| K+     | <7.1 | 7.1-7.19 | 7.2-7.29 | 7.3-7.39 | 7.4-7.44 | >7.45 |
|--------|------|----------|----------|----------|----------|-------|
| >6     | 2800 | 2800     | 2800     | 2800     | 2600     | 2600  |
| 5.5-6  | 2700 | 2700     | 2700     | 2500     | 2400     | 2400  |
| 5-5.5  | 2700 | 2500     | 2400     | 2300     | 2300     | 2200  |
| 4.5-5  | 2700 | 2300     | 2200     | 2000     | 2000     | 2000  |
| 4-4.5  | 2500 | 2200     | 2000     | 2000     | 1800     | 1800  |
| <4     | 2500 | 2200     | 2000     | 1800     | 1600     | 1600  |

---

## Anticoagulation modals
Separate from dosing logic. Launched via purple button on result screen.

### Citrate modal (no weight parameter)
- Exclusions: Acute liver failure, severe lactic acidosis, pH >7.5 or HCO3 >40, no central venous access (exc. Vascath), IBW <=40kg
- Cautions: Lactate >5 mmol/L, chronic liver disease, post hepatic resection
- Initial Ca check: iCa + pH on ABG/VBG before starting; if iCa <0.9 give 10mL Ca Gluconate; set ratio 1.7 mmol/L
- Citrate setup: OMNISET-L or PRO sets only; citrate ratio 4 mmol/L — NEVER ADJUST
- Calcium monitoring table (6 columns: <0.8, 0.81-0.89, 0.9-0.99, 1.00-1.20, >1.20, >1.50)
- Max Ca RATIO = 2.9 mmol/L; NEVER reduce below 0.8 mmol/L

### Heparin modal (weight-dependent — separate from dosing weight)
- IBW threshold: <50 kg = 500 iu/hr start rate; >50 kg = 1000 iu/hr start rate
- Weight selector inside modal, independent of Step 1 dosing weight
- Setup: 20,000 or 40,000 units in 50mL syringe; bolus 2,000 units via filter on start + every new set
- Monitoring: APPTr 6-hourly after dose change, 12-hourly thereafter
- Tinzaparin + Factor X assay as directed on page 2
- STOP: press HEPARIN KEY (rate cannot be reduced to zero)
- APPTr titration:
  - <=2: no change (up 500 if filter clots, max 1500)
  - 2-4: down 500 iu/h
  - >4: STOP, recheck 4hrs, if <2 restart at 500

---

## Design system
```css
--bg: #0d1117          /* page background */
--surface: #161b22     /* card background */
--surface2: #1c2128    /* secondary surface */
--border: #30363d      /* borders */
--text: #e6edf3        /* primary text */
--muted: #7d8590       /* secondary text */
--teal: #2dd4bf        /* primary accent / step dots */
--blue: #60a5fa        /* weight step */
--purple: #a78bfa      /* protocol step / modals */
--amber: #fbbf24       /* pH step / alerts */
--green: #4ade80       /* K+ step / normal result */
--red: #f87171         /* blood flow value */
--stop-red: #ef4444    /* stop result */
```

---

## Splash screen
Animated SVG column logo from timcknowles/omni repo (components/Logo.vue).
Auto-dismisses after 4 seconds or on "Enter" tap.

---

## Service worker
- Strategy: network-first (fresh when online, cache fallback offline)
- Activation: page sends SKIP_WAITING to any waiting SW on load
- Version reporting: page sends GET_VERSION, SW responds with cleaned cache name
- Version displayed in app header, updates dynamically from active SW
- To bump version: change CACHE = 'rca-calc-vX.Y' in sw.js
- GitHub Actions injects short SHA automatically on deploy

---

## Versioning
- sw.js contains: const CACHE = 'rca-calc-v1.2'
- GitHub Actions injects short commit SHA on deploy e.g. v1.2-a3f9c2
- Version stamp in header reads from active SW via GET_VERSION message

---

## Deployment
- Push to main triggers GitHub Actions (.github/workflows/deploy.yml)
- Actions injects version, deploys to GitHub Pages automatically
- Settings > Pages > Source must be set to GitHub Actions (not branch)

---

## Critical rules
- NEVER conflate the two weight thresholds:
  - Dosing weight: <65kg / >=65kg (Steps 1-4, both protocols)
  - Heparin anticoag start rate: <50kg / >50kg (inside heparin modal only)
- Dosing logic and anticoagulation logic are SEPARATE
- Do not add external JS dependencies — keep it vanilla
- Dose tables are the source of truth — verify any edits against original protocol images
- Always bump CACHE version in sw.js with every meaningful change

---

## Planned features / backlog
- [ ] No-anticoagulation option (third protocol)
- [ ] Session history / recent calculations
- [ ] Print/share result
- [ ] Dark/light mode toggle

---

## Mobile handoff
To continue development on mobile via claude.ai, paste this URL into the chat:
https://raw.githubusercontent.com/timcknowles/OMNIV2/main/CLAUDE.md
