# The Build: staff growth history (updated Nov 15, 2026)

Lives as "The Build" tab inside Front Office: https://claude.ai/artifact/9T4LYFh9UZrb4oLwmzktS5

## Decisions (Josh)
- Built into Front Office, behind a two-question riddle gate (both answers required). The riddle is a speed bump; the real lock is the access rules: pay readable and writable only by Editors (Josh as owner, Lucas as Editor). Growth data readable by Contributors, editable by Editors.
- Year labels use PY (program year). Years can be added before the first year or after the last.
- No level names on the tower. Each year shows year + title.
- Brick colors: "One color" (terracotta like the BRYC building, dark brick at the first year, lighter going up; past years solid, current year fills in as habits are rated) or "By Winning Habit" (darker = stronger rating). Ratings 1 Emerging, 2 Developing, 3 Consistent, 4 Model.
- Milestones: gold brick plus trail marker. Job title changes are recorded as "Became [title]".
- Kept as simple as possible (Nov 15): removed the estimates checkbox, team field, move buttons, work email, other pay, FTE, example view, spreadsheet import and most hint text.
- Staff will later see their own tower (with their own pay) in the OKRA site.

## Views (Editors)
- One person: tower, years, Winning Habits, OKRAs, Pay, Milestones.
- Pay panel starts with Level (Associate, Manager, Lead Manager, Director, Chief). It shows the band and whether current base is in, below or above it. Changing Level here also moves the person's tier on the current plan's Roster, so everything stays in sync.
- Whole staff: chart of current base pay vs. years at BRYC (counting the current year), colored Chief / Director / Manager levels, hollow dot = outside band; hover for details, click to open the person. Table underneath with exact figures.

## Pay data (loaded Nov 15 from the FY23-FY27 salary sheets plus Nov 15 payroll)
- Current employees only (19 people). Part-time pay ignored.
- Each year's base is the end-of-year salary; mid-year raises and start-of-year figures go in "What changed".
- Bonuses: FY23 sheet lists bonus percents; dollars computed on the prior year's salary (same method the FY26/FY27 sheets use).
- Tower start years follow years of service on the FY27 sheet.

## FY27 salary bands (in Front Office Setup)
- Associate $36K-$48K (part-time $13-$30/hr), Manager $48K-$62K, Lead Manager $62K-$67K (Kendrick, Tavidee), Director $65K-$89K, Chief $90K+.
- Myeisha's seat uses the Director band.
- Front Office cost estimate: (band midpoint + $16,546.97 admin and benefits) x FTE per seat.

## Open risk before pay goes into the OKRA site
- Anyone with AWS/database admin on the OKRA site (today Tavidee) could read every salary. Decide who holds that access, or keep pay in a separate store.
