# BRYC Front Office (staffing planner)

Live tool: https://claude.ai/artifact/9T4LYFh9UZrb4oLwmzktS5
Built Nov 10, 2026. Scenarios are stored in the page's shared database (collection `scenarios`, one document per scenario). Only people shared as Contributor or Editor can see or edit data; Viewers see an empty planner.

## What it does
- Roster board: teams as rows (Executive, Learning, Seniors, Advising, Persistence, Recruitment, Operations, Development), tiers as columns (Chiefs, Directors, Managers, Part-time / contract). Drag to move; click to edit title, status, role type, reporting line, dotted line, FTE, night limit, pay band, role description.
- Org chart: drag onto a person to change who someone reports to.
- Download PDF (Roster tab): two-page PDF of the Board and the Org chart for the scenario you're viewing.
- Named scenarios: "Save as new" (header or Roster toolbar) copies the scenario you're viewing under a name you choose; play in the copy, the original stays as it was. "Make current plan" promotes one.
- Program math: Fellows by grade and campus, cohort size (seniors separate), nights per PM, 1:X target, enrollment vs. expected attendance, 9th/10th combining per campus, program nights per grade group, rooms per campus. Shows PMs and senior counselors needed vs. on roster.
- Nights board: cohorts by room and night per campus, lead per cohort, free backups per night, auto-place.
- Checks: over night limit, double-booked, room too small, cohorts without room or lead, too many direct reports, no backup, open seats.
- Compare: pick two scenarios; lists what's different in plain words, then only the numbers that changed.
- Project next year (retention % plus new recruits).
- The Build tab (riddle-gated, two questions): see the-build-plan.md.

## How the numbers work (decided Nov 15, 2026)
- Est. annual cost has two modes, shown on the scoreboard tile with a line-by-line breakdown:
  - Midpoint (default, what Contributors see): every seat (filled, open or planned) at (pay band midpoint + admin and benefits) x FTE.
  - Actual (Editors only, Josh and Lucas): each filled person's real current base pay from The Build (not scaled by FTE, since it's already their real pay), plus band midpoint x FTE for open or planned seats and anyone with no pay entered, plus admin and benefits x FTE for every seat. Resets to Midpoint on each visit so a screen share doesn't show payroll by accident.
- Admin and benefits default $16,546.97 per FTE (from the staff admin budget); editable in Setup.
- In a what-if draft, Actual uses each person's pay today, even if the draft promotes them.
- Level and seats stay in sync: moving someone to another tier resets their pay band to that tier, so Setup's seat counts follow. Lead Manager is the one band without its own tier (sits in Managers); pick it on the person's card or in The Build.
- Changing Level in The Build updates that person's tier and band on the current plan.
- "Direct reports" setting (formerly "Org rules"): flags anyone with more than N direct reports (default 6).

## Starting data (scenario "PY27 as of November")
- Fellow counts from the PY27 Schedule Dashboard summer projection (Downtown 8th 26, 9th 59, 10th 64, 11th 98, 12th 117; Airline 7, 19, 22, 26, 46). Needs current enrollment.
- Downtown rooms in use: Hustle 1, Hustle 2, Integrity 3 (30), Integrity 2 (assumed 20-seat room). Other rooms from the PY25 floor plan listed but off.
- Airline: Hustle 1, Hustle 2, Integrity (30), Tue and Wed.
- Night assignments from the Sept 21 room lists.

## Open items to confirm
- Which Downtown room seats about 20.
- Jack and Tristan: role, hours, night limits.
- Whether 1:30 per cohort or 1:100 per PM governs (30 x 3 nights = 1:90).
- Role type for Advising and Persistence (direct service, but not teaching Fellows).
- Whether work-study part-time seats should count $0 in the cost estimate.
- Whether part-time seats get the full admin and benefits cost or a prorated share (currently prorated by FTE).
- Whether Actual mode should include bonuses (base pay only today).
