# Ghurni — Before Landfall

180 seconds · 1920×1080 · 30 fps · English narration + captions

## 0–9s — WHERE DO WE PREPARE FIRST?

Before a cyclone reaches Bangladesh, response teams face an urgent question. Which communities should prepare first?

Visual: hook. The hours before landfall shape local decisions.

## 9–17s — GHURNI

District officers and volunteers need time to brief teams and coordinate local support.

Visual: title. A cyclone decision-support prototype for Bangladesh.

## 17–30s — A TRACK IS ONLY THE START.

Cyclone-prone coasts around the world face the same gap. A track shows where the storm may go. Local teams still have to work out where damaging winds might reach.

Visual: map. Which communities? How many people? How uncertain?

## 30–44s — KEEP THE UNCERTAINTY.

Ghurni brings live monitoring and historical impact analysis into one workspace. Teams can check the latest reported storm position, then use archived ensembles to explore how uncertainty changes local priorities.

Visual: tracks. Archived Remal forecast · 50 plausible tracks in one cycle

## 44–60s — MAKE THE IMPACT LOCAL.

We run each archived forecast through a physical wind model, then combine it with population data. This turns a set of storm tracks into local wind probabilities and estimated exposure ranges.

Visual: pipeline. Forecast paths → wind simulation → union-level exposure

## 60–75s — CHECK THE LATEST FIX.

In Live mode, the map combines storm fixes with model winds. Here the feed is connected, but the last reported fix is old. Ghurni flags it and pauses the nowcast.

Visual: capture / actual application capture. Cyclone position, model weather, and data freshness.

## 75–88s — SEE WHAT MAY FOLLOW.

Forecast mode shows the provider’s track and uncertainty cone when available. Regional weather frames extend through day five. Missing intensity stays blank.

Visual: capture / actual application capture. Provider forecast track and regional weather.

## 88–101s — 5,160 UNIONS.

Switch to Historical and replay Cyclone Remal. Search for Amadi and check its wind probability. Compare the three forecast cycles to see how its risk changes.

Visual: capture / actual application capture. Search a community, then compare forecast cycles.

## 101–111s — ACT. PREPARE. MONITOR.

Set a probability threshold to sort unions into action tiers. Export the list or draft a briefing for review.

Visual: capture / actual application capture. Adjust the rule, export priorities, and review the briefing.

## 111–120s — BANGLA + ENGLISH.

Switch to Bangla for the forecast map and source panel. Historical exports also support both languages.

Visual: capture / actual application capture. A language switch built into the map, panels, and exports.

## 120–135s — ESTIMATE WITH EVIDENCE.

A Kalman filter updates position and motion as new fixes arrive. Between fresh fixes, it estimates motion and tracks uncertainty. Open Meteo supplies the separate regional weather model.

Visual: models. Fresh observations → Kalman filter → position and uncertainty

## 135–150s — TRAIN. TEST. COMPARE.

We train an isotonic regression calibrator, leaving each test storm out of training. Calibration did not consistently improve the model-based backtest, so the replay displays raw ensemble probabilities.

Visual: capture / actual application capture. Leave-one-storm-out isotonic regression · six historical storms

## 150–164s — TEST IT WITH RESPONSE TEAMS.

Our proposed pilot measures time to a reviewable priority list and whether users recognise stale fixes. Results will guide validation and future shelter and flood layers.

Visual: impact. Proposed pilot with coastal disaster management teams.

## 164–174s — BUILT IN BANGLADESH.

We’re Asim, Tawrat, Fahmida, and Shohidur. We’re looking for local teams to help evaluate Ghurni.

Visual: team. International AI Builders Congress · ClimateSphere AI / Climate Shield

## 174–180s — FROM FORECAST TO ACTION.

Ghurni. From forecast to action. Follow official warnings.

Visual: close. github.com/UniqueSwagger/ghurni
