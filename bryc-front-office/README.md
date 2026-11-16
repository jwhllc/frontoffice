# BRYC Front Office

> **Private repo. Contains staff salaries** (`data/pay/`). Keep it private, and think before adding anyone as a collaborator: everyone you add can read every salary, including the full history in past commits.

A staffing planner for the Baton Rouge Youth Coalition, built like a sports front office. Move people across teams and tiers, test what-if scenarios, check program ratios and room use, and track each staff member's growth over time in The Build.

**Live tool:** https://claude.ai/artifact/9T4LYFh9UZrb4oLwmzktS5. It runs on claude.ai and is private to Josh until shared.

## What's in here

| Path | What it is |
|---|---|
| `index.html` | The whole app: one file with HTML, CSS and JavaScript. This is exactly what's published to claude.ai. |
| `artifact.json` | Where it's published, the current version, and the data access rules. |
| `data/scenarios/` | Snapshot of every saved scenario (roster, Fellow counts, rooms, nights, settings). |
| `data/build/` | Snapshot of The Build: each person's years, titles, milestones, Winning Habit ratings and OKRAs. |
| `data/pay/` | **Salaries.** Snapshot of each person's base pay, bonus and notes by program year. |
| `data/seed/starting-scenario.json` | The original starting scenario from Nov 10, 2026, used by the tests. |
| `docs/` | Planning notes and decisions for the Front Office and The Build, plus the first concept sketch. |
| `test/` | Automated browser tests that run the page with made-up data. |

Data files are snapshots as of the date in the last commit. **The live data lives in claude.ai, not here.** Editing a JSON file in this repo doesn't change the live tool.

## How the app works

- **Tabs:** Roster (Board and Org chart), Program math, Nights board, Compare, The Build, Setup.
- **Scenarios:** "Save as new" copies the scenario you're viewing under a new name. One scenario is marked the current plan.
- **Checks:** flags problems as you move things: night limits, double-booked rooms, rooms too small, cohorts with no room or lead, too many direct reports, open seats.
- **Est. annual cost:** for each seat, (band midpoint + admin and benefits) × FTE. Admin and benefits default to $16,546.97 per FTE. Editors can switch to **Actual**, which uses real current base pay for filled seats and midpoints for open ones.
- **Levels and bands:** moving someone to another tier moves their pay band too. Lead Manager is picked on the person's card or in The Build.
- **The Build:** gated by two riddle questions. The riddle is a speed bump; the real lock is the access rules below.
- **Download PDF:** two-page PDF of the Board and Org chart, generated in the browser with no outside libraries.

## Who can see what (enforced by claude.ai)

| Data | Read | Write |
|---|---|---|
| Scenarios | Anyone shared as Contributor or Editor | Same |
| The Build (`build`, `buildmeta`) | Contributors and Editors | Editors only |
| Pay (`pay`) | **Editors only** (Josh, Lucas) | Editors only |

Viewers see an empty planner.

## Making changes

The usual way is to ask Claude in the BRYC Management project to change the Front Office. Claude edits `index.html`, tests it, and republishes to the same link. After that:

1. Copy the new `index.html` into this folder (or ask Claude to update this repo).
2. In GitHub Desktop, write a short summary of what changed, click **Commit to main**, then **Push origin**.

To refresh the data snapshots, ask Claude to re-export the Front Office data into `data/`.

## Running the tests

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npx playwright install chromium
npm test
```

The tests load `index.html` in a headless browser with a fake claude.ai database and **made-up pay**. They never read `data/pay/`. Screenshots and the test PDF land in `test/out/`, which git ignores.

- `test/regression.test.js`: roster drag and drop, editing, nights board, auto-place, scenarios, mobile layout.
- `test/features.test.js`: PDF export, tier and band sync, Save as new, Compare, Setup, the riddle gate, Level picker, Whole staff chart, dark mode, mobile.
- `test/cost.test.js`: the Midpoint and Actual cost views.
