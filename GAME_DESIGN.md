# Rebar Supply Chain Coordination Game — Design Document

**Project:** `rebar-supply-chain-game`  
**Game title:** Rebar Supply Chain Coordination Game  
**Stack (planned):** React + Vite  
**Status:** Design only — no implementation yet

---

## 1. Learning Objectives

This game teaches **Rebar Supply Chain Coordination** between a **Contractor** (player) and a **Supplier** (automated agent). The player learns how coordination strategy (Push vs Pull) and **planning reliability (PPC)** jointly determine supplier inventory, delivery timing, and expediting.

| Objective | What the player learns |
|-----------|------------------------|
| **Early schedules are not equal to firm commitments** | In Push, an early delivery schedule issued ~2 months ahead drives supplier shop drawings and fabrication long before the contractor confirms the true delivery due date. |
| **Unreliable planning inflates supplier inventory** | When the early schedule does not match what is eventually confirmed, fabricated rebar sits in the supplier yard — especially under Push. |
| **Pull improves information quality before fabrication** | Pull requires sharing a 3–4 week look-ahead schedule before the supplier starts fabrication, reducing speculative inventory. |
| **Delivery deviation is measured against confirmation, not the early schedule** | **Delivery deviation = Actual delivery date − Confirmed delivery due.** The metric reflects coordination at confirmation time, not supplier response to an outdated plan. |
| **PPC drives deviation magnitude** | High PPC (>85%) produces small deviations; Medium (60–85%) moderate; Low (<60%) large — visible in Monte Carlo outcomes. |
| **Expediting is a consequence of poor coordination** | Rush shipments appear when confirmed dates and fabrication timing misalign; they are counted and compared across scenarios. |
| **Push vs Pull inventory gap is measurable** | Pull should achieve **2.5×–3× lower average supplier inventory** than Push under comparable PPC, demonstrating the cost of early speculative fabrication. |

**Primary audience:** Construction management, lean construction, and supply chain students in classroom or workshop settings.

**Player role:** Contractor only. Supplier behavior is automated but visible on screen.

---

## 2. User Journey

The player manages **40 delivery releases** of rebar over the project life, coordinating with one supplier.

### Act 1 — Setup (3–5 min)

1. **Welcome / Briefing** — Project context: rebar supply for a multi-phase installation job (340 tons total).
2. **Choose coordination mode** — **Push** or **Pull**.
3. **Choose planning reliability** — **High PPC (>85%)**, **Medium PPC (60–85%)**, or **Low PPC (<60%)**.
4. **Tutorial** (optional) — Walkthrough of the split-screen layout: Contractor side, Supplier side, schedule flow, inventory yard.

### Act 2 — Release Loop (core gameplay)

The game advances **release by release** (40 total). Each release follows a coordination cycle:

#### Shared steps (both modes)

1. **Review prior release results** — Actual delivery, confirmed due, deviation, yard inventory, expedites.
2. **Release or update Delivery Schedule** — Player sends schedule information toward the supplier (animated flow).
3. **Supplier returns Shop Drawings** — Visual return animation; supplier acknowledges schedule (automated).
4. **Fabrication phase** — Supplier produces rebar for this release (animated); inventory piles grow in the yard.
5. **Confirm Delivery Due** — Player confirms the firm delivery due date (~1 week before installation in Push; aligned with look-ahead in Pull).
6. **Delivery event** — Monte Carlo resolves **actual delivery date** from PPC level and mode.
7. **Metrics update** — Deviation, on-time flag, inventory snapshot, expedite count if triggered.

#### Pull-only mandatory step

Before fabrication can begin for a release batch, the player **must click “Share Look-Ahead Schedule”** (3–4 week horizon). Until clicked:

- Fabrication is **blocked** (visual idle state at supplier).
- A prominent call-to-action remains on the Contractor side.
- Event feed explains: *“Supplier waiting for look-ahead before fabrication.”*

This step is **required every time** a new fabrication window opens — not optional, not auto-skipped.

### Act 3 — Debrief (5 min)

1. **Summary scorecard** — All six primary metrics (see §9).
2. **Pull vs Push comparison** — If instructor runs paired scenarios: inventory reduction %, deviation histograms.
3. **Reflection prompts** — e.g., *“Why did Push inventory stay high even when deliveries were on time?”*
4. **Replay / new scenario** — Same seed, swap mode or PPC level.

### Emotional arc

- **Releases 1–10:** Player learns the visual flow; Push yard inventory begins to climb.
- **Releases 11–25:** Schedule changes from PPC noise cause visible pile-up (Push) or blocked fabrication moments (Pull until look-ahead shared).
- **Releases 26–40:** Cumulative metrics diverge clearly between modes; expedites spike under Low PPC + Push.
- **End:** Player articulates why Pull reduced inventory and how PPC affected deviation regardless of mode.

---

## 3. Screen Flow

```
┌──────────────────┐
│ Welcome /        │
│ Briefing         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Scenario Setup   │
│ • Push | Pull    │
│ • High | Med |   │
│   Low PPC        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Tutorial         │ (optional skip)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                 MAIN GAME — Split Screen                      │
│                                                               │
│  CONTRACTOR (left)          SUPPLIER (right)                  │
│  ┌─────────────────┐        ┌─────────────────┐              │
│  │ Delivery        │ ─────► │ Shop Drawings   │              │
│  │ Schedule        │        │ (return arrow)  │              │
│  └─────────────────┘        └─────────────────┘              │
│                                                               │
│  [ Share Look-Ahead ]       Fabrication (active/blocked)      │
│  (Pull only — required)                                       │
│                                                               │
│  Confirmed Delivery Due     Inventory Yard (rebar piles)      │
│  Actual Delivery              ↑ grows with Push               │
│  Delivery Deviation                                           │
│                                                               │
│  Release 12 / 40    [ Confirm Delivery Due ]  [ Next Release ]│
└──────────────────────────────────────────────────────────────┘
         │
         │ (after release 40)
         ▼
┌──────────────────┐
│ Results /        │
│ Debrief          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ New Scenario     │
└──────────────────┘
```

### Screen inventory

| Screen / panel | Purpose |
|----------------|---------|
| **Welcome / Briefing** | Title, learning goals, project constants (40 releases, 8.5 t avg, 340 t total). |
| **Scenario Setup** | Push vs Pull; High / Medium / Low PPC. |
| **Tutorial** | Highlights split layout, schedule animation, Pull look-ahead button, deviation readout. |
| **Contractor panel** | Delivery Schedule, Confirmed Delivery Due, Actual Delivery, Delivery Deviation, Pull look-ahead action. |
| **Supplier panel** | Shop Drawings status, Fabrication progress, Inventory Yard. |
| **Center flow strip** | Animated documents/material flow between sides. |
| **Metrics bar** | Live running totals (inventory, deviation, OTD, expedites). |
| **Event feed** | Narrated coordination events per release. |
| **Results / Debrief** | Final metrics, charts, Pull vs Push inventory reduction %. |

### Navigation rules

- Game progresses **one release at a time**; player confirms delivery due before advancing (Push) or after sharing look-ahead (Pull).
- **Pull:** “Next Release” / fabrication advance **disabled** until “Share Look-Ahead Schedule” is clicked for the current fabrication window.
- **Push:** Early schedule is issued automatically at ~2-month lead; player still confirms delivery due ~1 week before installation.
- Debrief unlocks after **release 40** only.

---

## 4. Game Assumptions

### Project demand (fixed base case)

| Parameter | Value |
|-----------|-------|
| **Total delivery releases** | 40 |
| **Average rebar per release** | 8.5 tons |
| **Total project demand** | **340 tons** |

Each release represents one coordinated shipment tied to an installation activity. Tonnage per release may vary slightly (±10%) via Monte Carlo but **must average 8.5 t** over 40 releases.

### Agents

| Agent | Role |
|-------|------|
| **Contractor (player)** | Chooses Push or Pull, sets PPC level at start, releases schedules, confirms delivery due dates, shares look-ahead (Pull), views all metrics. |
| **Supplier (automated)** | Prepares shop drawings, fabricates rebar, holds inventory in yard, delivers on resolved actual date, expedites when rules trigger. |

### Time model

- **Installation date** — Target date rebar must be on site for each release.
- **Push — early schedule lead** — ~**2 months (8 weeks)** before installation; drives shop drawings and fabrication start.
- **Push — confirmation lead** — Contractor confirms **Confirmed Delivery Due** ~**1 week before** installation.
- **Pull — look-ahead window** — **3–4 weeks** before fabrication begins; player must explicitly share.
- **Pull — confirmation** — Confirmed Delivery Due aligned with look-ahead schedule (typically firmer than Push early schedule).

### Delivery deviation (canonical definition)

```
Delivery Deviation (days) = Actual Delivery Date − Confirmed Delivery Due
```

- **Negative** → early delivery  
- **Zero** → on time  
- **Positive** → late delivery  

Deviation is **not** measured against the early Push schedule or initial Pull schedule — only against **Confirmed Delivery Due**.

### On-time delivery

A release counts as **on time** when `Actual Delivery Date ≤ Confirmed Delivery Due` (same-day or early).

### Inventory model

- Fabricated rebar not yet delivered accumulates in the **Supplier Inventory Yard** (tons).
- **Push:** Supplier fabricates to the **early delivery schedule**; when installation slips or quantities change before confirmation, undelivered rebar remains in yard → **high average inventory**.
- **Pull:** Supplier fabricates only after **look-ahead is shared**; shorter commitment horizon → **much lower average inventory**.

### Design target: Push vs Pull inventory ratio

Simulation tuning must ensure:

```
Average Supplier Inventory (Push)  ≈  2.5× to 3.0×  Average Supplier Inventory (Pull)
```

Hold this ratio across PPC levels (absolute levels change with PPC; ratio should remain in band). Validate during implementation with Monte Carlo batch runs.

### Expediting

- **Expedite shipment** triggered when fabrication/delivery timing cannot meet Confirmed Delivery Due without premium effort (rule-based + Monte Carlo).
- Player may be offered expedite choice in v1, or expedites may be auto-applied when deviation would exceed threshold — **count always tracked** in metrics.

### Simplifications

- Single supplier, single job site.
- Rebar modeled as **aggregate tons** (no separate bar sizes in v1).
- Shop drawings are a **coordination milestone** (time + animation), not a detailed review mini-game.
- Transportation abstracted to dates; no route map.

---

## 5. Push Scenario

**Concept:** The contractor **pushes** schedule information far ahead of need. The supplier acts on the **early delivery schedule** before the contractor provides a firm **Confirmed Delivery Due**.

### Sequence per release

```
T − 8 weeks   Contractor releases Early Delivery Schedule (~2 months before installation)
      ↓
              Supplier prepares Shop Drawings → returns to contractor (visual)
      ↓
              Supplier starts Fabrication based on EARLY schedule
      ↓
              Inventory Yard accumulates fabricated rebar
      ↓
T − 1 week    Contractor confirms Confirmed Delivery Due
      ↓
T (install)   Actual Delivery resolved (Monte Carlo + PPC)
      ↓
              Delivery Deviation = Actual Delivery − Confirmed Delivery Due
```

### Why Push inventory runs high

1. Fabrication starts **~2 months early** against a schedule that is **not yet firm**.
2. **Planning reliability (PPC)** causes the eventual Confirmed Delivery Due and installation timing to **deviate** from the early schedule.
3. Already-fabricated rebar waits in the yard → **supplier inventory accumulates**.
4. Even cooperative supplier behavior cannot eliminate inventory if the contractor’s early signal was unreliable.

### Player actions (Push)

| Action | When | Required |
|--------|------|----------|
| Review / accept early schedule release | ~2 months ahead (auto-issued or player acknowledges) | Yes (ack) |
| Confirm Delivery Due | ~1 week before installation | **Yes — player click** |
| Expedite (if offered) | When late risk detected | Optional |

### Supplier agent behavior (Push)

- Begin shop drawings upon receiving early schedule.
- Start fabrication immediately after drawings complete (no look-ahead gate).
- Fabricate **full early-schedule tonnage** for the release (default 8.5 t ± variance).
- Hold undelivered fabrications in yard until Actual Delivery event clears them.

### Pedagogical point

Push feels “proactive” but **externalizes cost to supplier inventory** when PPC is not high. Students see piles grow in the yard even when late deliveries are partially avoided.

---

## 6. Pull Scenario

**Concept:** The contractor **pulls** fabrication timing forward only when reliable near-term information is shared. Supplier waits for explicit **look-ahead** before producing.

### Sequence per release

```
T − initial   Contractor releases Initial Delivery Schedule (project-level)
      ↓
T − 3~4 wks   Contractor clicks "Share Look-Ahead Schedule"  ← MANDATORY GATE
      ↓
              Supplier prepares Shop Drawings → returns to contractor
      ↓
              Supplier starts Fabrication (ONLY after look-ahead shared)
      ↓
              Inventory Yard grows modestly
      ↓
              Contractor confirms Confirmed Delivery Due (aligned with look-ahead)
      ↓
T (install)   Actual Delivery resolved (Monte Carlo + PPC)
      ↓
              Delivery Deviation = Actual Delivery − Confirmed Delivery Due
```

### Why Pull inventory stays lower

1. Fabrication starts **3–4 weeks** ahead, not 2 months.
2. Look-ahead reflects **more current** installation planning.
3. Less time for schedule changes to strand fabricated rebar in yard.
4. **Information quality at fabrication start is higher** → less speculative tonnage.

### Mandatory UI: “Share Look-Ahead Schedule”

| Requirement | Detail |
|-------------|--------|
| **Visibility** | Prominent button on Contractor panel; pulses until clicked. |
| **Blocking** | Supplier fabrication shows **idle / waiting** until clicked. |
| **Frequency** | Required each time a new look-ahead window opens for upcoming releases (not one-time for whole project). |
| **Feedback** | On click: schedule animates to supplier; shop drawing step begins; event feed confirms. |
| **No bypass** | No keyboard shortcut or auto-timer skip in v1 — instructor mode may override for demos only. |

### Player actions (Pull)

| Action | When | Required |
|--------|------|----------|
| Maintain Initial Delivery Schedule | Project start | Auto / review |
| **Share Look-Ahead Schedule** | 3–4 weeks before fabrication | **Yes — player click** |
| Confirm Delivery Due | Before delivery window | Yes |
| Expedite (if offered) | When late risk detected | Optional |

### Supplier agent behavior (Pull)

- **Do not fabricate** until look-ahead received.
- Shop drawings begin after look-ahead (parallel or immediately after — tune for pacing).
- Fabricate to **look-ahead tonnage** only.
- Maintain **minimal yard buffer** (small safety stock constant).

### Pedagogical point

Pull makes **information sharing visible and mandatory**. Students feel the coordination dependency: supplier production is literally paused until the contractor acts.

### Push vs Pull contrast (design intent)

| Dimension | Push | Pull |
|-----------|------|------|
| Schedule driving fabrication | Early schedule (~2 months) | Look-ahead (3–4 weeks) |
| Fabrication gate | None | **Share Look-Ahead** click |
| Avg supplier inventory | **High** | **Low (2.5–3× less than Push)** |
| Information quality at fab start | Low–medium (early plan) | Higher (recent look-ahead) |

---

## 7. PPC Levels

**PPC (Percent Plan Complete)** represents **planning reliability** — how closely installation and delivery dates in the contractor’s schedules match what actually happens.

The player selects one level at scenario start. PPC governs **Monte Carlo delivery date deviation** magnitude (see §8).

### Three levels (player-facing)

| Level | PPC range | Label | Expected behavior |
|-------|-----------|-------|-------------------|
| **High** | **> 85%** | Reliable planning | Small delivery deviations; early and confirmed schedules mostly align; lower expedite rate. |
| **Medium** | **60–85%** | Typical planning | Moderate deviations; visible inventory/delivery trade-offs; occasional expedites. |
| **Low** | **< 60%** | Unreliable planning | Large deviations; Push yard piles grow sharply; Pull still better than Push but more expedites and late deliveries. |

### How PPC affects the simulation

1. **Schedule drift** — Installation dates and confirmed dues shift from planned values with probability tied to PPC band.
2. **Delivery deviation draws** — Actual delivery date sampled relative to Confirmed Delivery Due; dispersion scales inversely with PPC (High = tight, Low = wide).
3. **Push inventory interaction** — Low PPC increases mismatch between **early schedule fabrication** and **confirmed due**, inflating yard inventory beyond Medium/High.
4. **Pull interaction** — Look-ahead reduces but does not eliminate deviation; Low PPC still produces large deviations, but **average inventory remains below Push** at same PPC.

### Suggested dispersion targets (implementation tuning)

| PPC level | Std dev of delivery deviation (days) | Typical \|deviation\| range |
|-----------|--------------------------------------|----------------------------|
| High (>85%) | 0.5–1.5 | Mostly −1 to +2 days |
| Medium (60–85%) | 2–4 | Often −3 to +5 days |
| Low (<60%) | 5–8 | Frequently −7 to +10 days |

Exact distributions defined in §8; values above are tuning targets for classroom readability.

### Classroom exercise

Run **2×2 comparison** at same random seed:

- Push + Low PPC vs Pull + Low PPC → highlight inventory reduction %  
- Pull + Low PPC vs Pull + High PPC → highlight deviation and OTD shift  

Hypothesis for students: *Pull reduces inventory regardless of PPC; High PPC improves OTD in both modes.*

---

## 8. Monte Carlo Variables

Monte Carlo runs **per release** at the delivery resolution step (and optionally at schedule drift steps). Primary purpose: generate **delivery date deviations** consistent with selected **PPC level**, while preserving **Push inventory >> Pull inventory**.

### Primary variable: delivery date deviation

```
Actual Delivery Date = Confirmed Delivery Due + Δdays

Δdays ~ distribution(PPC level, coordination mode)
```

| PPC level | Distribution (proposed) | Notes |
|-----------|-------------------------|-------|
| **High (>85%)** | Normal(μ = 0, σ = 1.0) days, clipped to [−2, +3] | Small deviations |
| **Medium (60–85%)** | Normal(μ = +0.5, σ = 3.0) days, clipped to [−5, +8] | Moderate late skew |
| **Low (<60%)** | Normal(μ = +2, σ = 6.0) days, clipped to [−10, +14] | Large deviations |

**Mode adjustment (optional secondary effect):**

- **Pull:** σ × 0.85 — slightly tighter deviations because look-ahead improves information quality before fabrication.
- **Push:** σ × 1.0 — baseline.

### Secondary variables

| Variable | When drawn | Effect |
|----------|------------|--------|
| **Installation date drift** | Before confirmation | Shifts Confirmed Delivery Due relative to early / look-ahead schedule; stronger drift at Low PPC |
| **Release tonnage** | Per release | Normal(8.5, 0.85) tons, clipped [6, 11]; total constrained to ~340 t over 40 releases |
| **Fabrication complete date** | Push / Pull fab phase | Determines how long rebar sits in yard before delivery clears inventory |
| **Expedite trigger** | If Δdays would exceed +3 (Medium) or +5 (Low) without expedite | +1 expedite shipment; reduces Δdays by 3–5 days at cost |
| **Shop drawing delay** | 10% chance +2 days | Delays fabrication start; visible in supplier panel |

### Inventory accumulation logic (Monte Carlo coupling)

**Push:**

- On fabrication complete, add tonnage to yard.
- Yard clears on Actual Delivery.
- If installation drifts later (Low PPC), rebar **accumulates longer** → higher time-weighted average inventory.

**Pull:**

- Fabrication starts only after look-ahead click (deterministic gate, not random).
- Shorter fab-to-install window → **lower average yard level**.
- Tune fab lead time so Push avg inventory / Pull avg inventory ∈ **[2.5, 3.0]**.

### Random seed

- Display seed on debrief for reproducibility.
- Instructor can lock seed so class compares Push vs Pull on identical random draws.

### Validation criteria (implementation phase)

- [ ] High PPC → mean \|Δdays\| < Medium < Low  
- [ ] Push avg inventory / Pull avg inventory ∈ [2.5, 3.0] across 1,000 batch runs per PPC level  
- [ ] Pull OTD ≥ Push OTD at same PPC (expected but not strictly required if tuning trade-offs arise — document if inverted)

---

## 9. Performance Metrics

Six **primary metrics** for debrief and classroom comparison. All shown live in the metrics bar and summarized at end.

| # | Metric | Definition | Unit |
|---|--------|------------|------|
| 1 | **Average supplier inventory** | Time-weighted mean tons in Supplier Inventory Yard across all 40 releases | **tons** |
| 2 | **Maximum supplier inventory** | Peak tons in yard at any single snapshot | **tons** |
| 3 | **Average delivery deviation** | Mean of (Actual Delivery − Confirmed Delivery Due) over 40 releases | **days** |
| 4 | **On-time delivery percentage** | Releases where Actual Delivery ≤ Confirmed Delivery Due | **%** |
| 5 | **Number of expedite shipments** | Count of premium rush deliveries | **#** |
| 6 | **Inventory reduction (Pull vs Push)** | `(AvgInv_Push − AvgInv_Pull) / AvgInv_Push × 100` | **%** |

### Metric display notes

- **Delivery deviation** shown per release on Contractor panel: Confirmed Delivery Due | Actual Delivery | Δ days (color: early = blue, on time = green, late = red-orange).
- **Inventory reduction %** appears on debrief when player has completed a run or when instructor loads paired results; single-run debrief shows absolute inventory with reference band (“typical Pull: 2.5–3× lower”).
- Running averages update after each release so students see trends before release 40.

### Secondary diagnostics (debrief only)

- Yard inventory time-series chart (Push vs Pull overlay).
- Histogram of 40 delivery deviations.
- Table of all releases: early schedule date, look-ahead date, confirmed due, actual, deviation, yard peak.

---

## 10. UI Ideas for a Vivid Classroom Simulation Game

Goal: a **split-screen coordination tableau** readable on a projector — students see material and information flow, not spreadsheets.

### Layout: Contractor left | Supplier right

```
┌─────────────────────────────┬─────────────────────────────┐
│         CONTRACTOR          │          SUPPLIER             │
│  🏗️ Site / office icon      │  🏭 Fab shop + yard icon     │
│                             │                             │
│  Delivery Schedule ──────────────► Shop Drawings         │
│              ◄────────────────── (return arrow)           │
│                             │                             │
│  [ Share Look-Ahead ]       │  Fabrication line           │
│  (Pull — pulsing CTA)       │  (blocked until look-ahead) │
│                             │                             │
│  Confirmed Delivery Due     │  ┌─ Inventory Yard ─────┐  │
│  Actual Delivery            │  │ ▓▓▓ rebar piles ▓▓▓   │  │
│  Delivery Deviation: +2d    │  │ (height ∝ tons)       │  │
│                             │  └───────────────────────┘  │
└─────────────────────────────┴─────────────────────────────┘
         Metrics: Avg Inv | Max Inv | Avg Dev | OTD | Expedites
```

### Required visual elements

| Element | Treatment |
|---------|-----------|
| **Delivery Schedule → Supplier** | Document card animates left-to-right on release; lists release #, tons, planned install date. |
| **Shop Drawings → Contractor** | Return animation right-to-left; stamp “Approved” after brief delay. |
| **Fabrication process** | Progress bar or conveyor with rebar bundles; sparks optional; **idle state** when Pull waits for look-ahead. |
| **Supplier Inventory Yard** | Side-view yard with **rebar pile sprites** stacking vertically as tons increase; shrink on delivery truck exit. |
| **Confirmed Delivery Due** | Large date badge on contractor side; player sets/confirms ~1 week before install (Push). |
| **Actual Delivery** | Revealed with truck arrival animation; date stamp next to confirmed due. |
| **Delivery Deviation** | `+2 days` / `On time` / `−1 day early` with color coding; feeds running average. |
| **Share Look-Ahead Schedule** | Primary button Pull mode only; disabled state grayed on supplier fab; success state green check. |

### Animation pacing (classroom-friendly)

- Each release: 15–30 seconds of animation + player confirmation (skippable “fast forward” for instructor).
- Truck delivery: short loop (~2 s) so 40 releases do not exhaust patience.
- Yard piles: instant height update acceptable if animation cost high — **height must reflect tons**.

### Art direction

- Industrial palette: concrete gray background, rust orange rebar, safety yellow CTAs, white typography.
- Large fonts (18px+ body) for projection.
- Color-blind safe: use shape + label (early ▲, late ▼) not color alone.

### Event feed (bottom ticker)

Examples:

- *“Release 7: Early schedule sent — fabrication started (Push).”*
- *“Release 12: Supplier waiting for look-ahead schedule.”*
- *“Release 12: Look-ahead shared — fabrication begins.”*
- *“Release 18: Actual delivery 3 days late vs confirmed due — expedite available.”*

### Debrief visuals

- **Bar chart:** Push vs Pull average & max inventory side by side.
- **Line chart:** Yard inventory over release index.
- **Dot plot:** 40 deviations colored by PPC level.
- **Hero stat:** Inventory reduction % when comparing modes.

### Instructor features (v1 nice-to-have)

- Pause + discussion prompts at releases 10, 20, 30.
- Preset scenarios: Push/Low, Pull/High, etc.
- Export screenshot of final scorecard.

### Tech notes (future implementation)

- React + Vite; simulation engine as pure TypeScript module.
- Animation: CSS transitions + light SVG; avoid heavy 3D.
- State: array of 40 release records for replay scrubber.
- No backend required for v1.

---

## Appendix A — Agent Summary

| | Contractor (player) | Supplier (automated) |
|--|---------------------|----------------------|
| **Chooses** | Push or Pull; PPC level | — |
| **Sends** | Delivery Schedule; Look-Ahead (Pull); Confirmed Delivery Due | Shop Drawings |
| **Triggers** | Share Look-Ahead click (Pull) | Fabrication, delivery, yard inventory |
| **Optimizes** | Installation success, low deviation, low inventory (learning) | Fulfill confirmed dues on time |

---

## Appendix B — Release Cycle Checklist (implementation reference)

**Push:** Early schedule → Shop drawings → Fabricate → Yard ↑ → Confirm due → Actual delivery → Deviation  
**Pull:** Initial schedule → **Share look-ahead** → Shop drawings → Fabricate → Yard ↑ (less) → Confirm due → Actual delivery → Deviation  

---

## Appendix C — Suggested Implementation Phases (not in scope now)

1. **Phase 0:** Simulation kernel — 40 releases, Monte Carlo, inventory accounting, metric validation (2.5–3× ratio).  
2. **Phase 1:** Split-screen shell, schedule / drawing animations, yard visualization.  
3. **Phase 2:** Push and Pull flows, mandatory look-ahead gate, confirmation step.  
4. **Phase 3:** Debrief charts, instructor presets, polish.

---

## Appendix D — Open Design Questions

- Should the player manually edit schedule dates before confirming due, or only acknowledge system-generated dates perturbed by PPC?
- Auto-expedite vs player expedite choice when deviation exceeds threshold?
- Show cumulative 340 t progress bar across releases?

*Document version: 1.1 — revised to Rebar Supply Chain Coordination spec*
