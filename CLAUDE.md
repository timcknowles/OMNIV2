# CLAUDE.md — RCA Dose Calculator (OMNIV2)

## Project overview
A clinical decision support PWA for Regional Citrate Anticoagulation (RCA) during CRRT (Continuous Renal Replacement Therapy). Deployed at:
**https://timcknowles.github.io/OMNIV2**

Repo: `github.com/timcknowles/OMNIV2`
Owner: Tim Knowles (@timcknowles)

---

## File structure
```
OMNIV2/
├── index.html       # Single-page app — all UI and calculator logic
├── sw.js            # Service worker — offline caching, version reporting
├── manifest.json    # PWA manifest — icons, display, start_url
├── icon-192.svg     # App icon (SVG, scales to any size)
├── icon-512.svg     # App icon (duplicate SVG for manifest)
└── CLAUDE.md        # This file
```

---

## Tech stack
- Vanilla HTML/CSS/JS — no framework, no build step
- PWA: service worker (network-first strategy) + web app manifest
- Hosted on GitHub Pages (branch: `main`, root `/`)
- Fonts: DM Sans + DM Mono via Google Fonts
- Deployment: GitHub Actions (auto on push to main)

---

## Design system
```css
--bg: #0d1117          /* page background */
--surface: #161b22     /* card background */
--surface2: #1c2128    /* secondary surface */
--border: #30363d      /* borders */
--text: #e6edf3        /* primary text */
--muted: #7d8590       /* secondary text */
--teal: #2dd4bf        /* primary accent */
--amber: #fbbf24       /* pH buttons active */
--red: #f87171         /* blood flow value */
--green: #4ade80       /* result (normal) */
--stop-red: #ef4444    /* result (stop) */
```

---

## App flow
1. **Splash screen** — animated SVG column logo (from Logo.vue in omni project), auto-dismisses after 4s or on "Enter →" tap
2. **Step 1** — Ideal Body Weight: `< 65 kg` or `≥ 65 kg`
3. **Step 2** — Arterial pH: 8 ranges from `<7.1` to `>7.55`
4. **Step 3** — Serum K⁺: 6 ranges in 3×2 grid, ascending `<4` to `>6`
5. **Blood flow card** — appears after pH selected, shows Q_B in mL/hr
6. **Bicarbonate alert** — shown if pH < 7.20 (⚠ administer 50mL 8.4% bicarb)
7. **Result card** — shows Q_D (dialysate flow) in mL/hr, or STOP/switch to heparin

---

## Dose tables

### IBW < 65 kg — Blood Flow (Q_B) by pH
| pH | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|----|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| QB | 130  | 120       | 110       | 100       | 80        | 80        | 80        | STOP  |

### IBW ≥ 65 kg — Blood Flow (Q_B) by pH
| pH | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|----|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| QB | 150  | 140       | 130       | 110       | 90        | 80        | 80        | STOP  |

### IBW < 65 kg — Dialysate Flow (Q_D) by pH and K⁺
| K⁺     | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|--------|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| >6     | 2300 | 2300      | 2200      | 2200      | 2200      | 2300      | STOP      | STOP  |
| 5.5-6  | 2100 | 2100      | 2100      | 2000      | 1900      | 2100      | 2300      | STOP  |
| 5-5.5  | 1900 | 1900      | 1900      | 1800      | 1700      | 1900      | 2100      | STOP  |
| 4.5-5  | 1800 | 1700      | 1700      | 1600      | 1500      | 1900      | 2100      | STOP  |
| 4-4.5  | 1600 | 1500      | 1400      | 1400      | 1400      | 1700      | 2100      | STOP  |
| <4     | 1400 | 1400      | 1400      | 1400      | 1400      | 1700      | 2100      | STOP  |

### IBW ≥ 65 kg — Dialysate Flow (Q_D) by pH and K⁺
| K⁺     | <7.1 | 7.10-7.19 | 7.20-7.29 | 7.30-7.39 | 7.40-7.44 | 7.45-7.49 | 7.50-7.54 | >7.55 |
|--------|------|-----------|-----------|-----------|-----------|-----------|-----------|-------|
| >6     | 2700 | 2700      | 2600      | 2600      | 2600      | 2700      | STOP      | STOP  |
| 5.5-6  | 2500 | 2500      | 2500      | 2400      | 2300      | 2500      | 2700      | STOP  |
| 5-5.5  | 2300 | 2300      | 2300      | 2200      | 2100      | 2300      | 2500      | STOP  |
| 4.5-5  | 2200 | 2100      | 2100      | 2000      | 1900      | 2300      | 2500      | STOP  |
| 4-4.5  | 2000 | 1900      | 1800      | 1800      | 1800      | 2100      | 2500      | STOP  |
| <4     | 1800 | 1800      | 1800      | 1800      | 1800      | 2100      | 2500      | STOP  |

---

## Versioning convention
- Version string lives in `sw.js`: `const CACHE = 'rca-calc-vX.Y';`
- GitHub Actions injects the short git SHA automatically on deploy: e.g. `v1.1-a3f9c2`
- Version is displayed in the app header, read dynamically from the active SW via `GET_VERSION` message
- To manually bump: change `CACHE` string in `sw.js` before committing

---

## Service worker behaviour
- **Strategy**: network-first (fresh content when online, cache fallback offline)
- **Activation**: page sends `SKIP_WAITING` message to any waiting SW on load
- **Version reporting**: page sends `GET_VERSION`, SW responds with cleaned cache name
- **Offline badge**: shown bottom-right when `navigator.onLine` is false

---

## Planned features / backlog
- [ ] Calcium titration table (follow-on screen after Q_D result)
- [ ] Session history / recent calculations
- [ ] Print/share result
- [ ] Dark/light mode toggle

---

## Handoff notes for Claude (mobile or Code)
- Always edit `index.html` and `sw.js` together when changing functionality
- Bump `CACHE` version in `sw.js` with every meaningful change
- Do not add external JS dependencies — keep it vanilla
- Test SW behaviour using Chrome DevTools → Application → Service Workers
- The dose tables are the source of truth — double-check any table edits against the original protocol image
- `CLAUDE.md` should be updated whenever the architecture or backlog changes
