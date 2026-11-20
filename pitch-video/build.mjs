// Rebuild the entire editable film from scenes.json, measured voice timings,
// actual app captures, and archived forecast geometry. No runtime network calls.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const scenes = JSON.parse(readFileSync("scenes.json"));
const narration = JSON.parse(readFileSync("narration.json"));
const facts = JSON.parse(readFileSync("assets/graphics/data-facts.json"));
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const attrs = (start, duration, track) =>
  `data-start="${start.toFixed(3)}" data-duration="${duration.toFixed(3)}" data-track-index="${track}"`;
const svg = (lead) =>
  readFileSync(`assets/graphics/forecast-${lead}.svg`, "utf8").replace(
    "<svg ",
    '<svg class="forecast-svg" data-layout-allow-overflow ',
  );
const sourceLine =
  "EOxCloudless 2024 / EOX · modified Copernicus Sentinel data 2024 · CC BY-NC-SA 4.0 · OpenFreeMap / © OSM contributors";
const liveSourceLine =
  "Live system capture · 20 Nov 2026 UTC · GDACS / JTWC · Open-Meteo model data · OpenFreeMap / © OSM contributors";
const credits = {
  live: "AKVAN-26 · latest reported fix 19 Nov, 18:00 UTC · nowcast paused",
  forecast: "GDACS / JTWC provider track · issued 19 Nov, 18:00 UTC",
  union: "Remal · 25 May 2024 12:00 UTC · forecast intensity · ≥34 kt",
  actions: "Example rule: P(wind ≥34 kt) ≥30% · Remal T−24 cycle",
  language: "Bangla forecast map and source panel · dated model weather",
  evidence:
    "The calibrator is evaluated offline. Raw ensemble probabilities remain the default.",
};
const liveCaptures = new Set(["live", "forecast", "language"]);
const team = [
  ["Md. Asim Alam Chowdhury", "Team lead"],
  ["Md. Tawrat Hossen Nibir", "Team member"],
  ["Fahmida Hossain", "Team member"],
  ["Shohidur Rahman", "Team member"],
];
function frame(s, i) {
  let extra = "",
    cls = "";
  const title = `<h1 class="headline enter">${esc(s.title)}</h1>`;
  const detail = `<p class="detail enter">${esc(s.detail)}</p>`;
  if (s.kind === "hook") {
    cls = "hook";
    extra = `<div class="montage" data-layout-ignore>${["live.jpg", "union.jpg", "forecast.jpg", "actions.jpg", "forecast-bangla.jpg", "map-24.jpg"].map((p, k) => `<div id="montage-${k}" class="montage-frame" style="background-image:url(assets/captures/${p})"></div>`).join("")}</div><div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="hook-copy">${title}${detail}<div class="signal enter"><span></span> THE WINDOW FOR PREPARATION IS OPEN.</div></div><p class="source enter">Ghurni product captures · Live, Forecast and Historical</p></div>`;
  } else if (["title", "close"].includes(s.kind)) {
    cls = "brand " + (s.kind === "close" ? "closing" : "");
    extra = `<div class="brand-rings" data-layout-ignore>${[0, 1, 2, 3].map((k) => `<div class="orbit o${k}"></div>`).join("")}</div><div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="brand-lockup">${title}${s.kind === "title" ? '<div class="bangla enter">ঘূর্ণি</div>' : ""}${detail}</div><p class="source enter">${s.kind === "close" ? "Decision support only · always follow official BMD warnings" : "International AI Builders Congress · ClimateSphere AI / Climate Shield"}</p></div>`;
  } else if (s.kind === "map" || s.kind === "tracks") {
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="two-col"><div class="copy">${title}${detail}<div class="rule enter"></div><p class="micro enter">${s.kind === "tracks" ? "50 archived ensemble members · GEFS / GEPS / NAVGEM-E" : "Local preparedness needs more than a centre line."}</p></div><div class="map-graphic enter">${svg(s.kind === "map" ? "single" : "72")}<div class="map-stamp">REMAL / 2024 <span>${s.kind === "map" ? "SINGLE ARCHIVED GFS FORECAST" : "ARCHIVED ENSEMBLE GEOMETRY"}</span></div></div></div><p class="source enter">Forecasts: UCAR RAL a-decks · boundaries: geoBoundaries / BBS–OCHA · editorial map projection</p></div>`;
  } else if (s.kind === "cycles") {
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="wide-title">${title}${detail}</div><div class="cycle-grid">${["72", "48", "24"].map((lead, k) => `<div class="cycle enter"><div class="cycle-head"><b>T−${lead}</b><span>${facts.modes[lead].members} MEMBERS</span></div><div class="mini-map">${svg(lead)}</div><div class="cycle-foot">ISSUED ${facts.modes[lead].issue} UTC</div></div>`).join("")}</div><p class="source enter">Cycle names are approximate lead-time labels. Use the issue timestamps for exact forecast context.</p></div>`;
  } else if (s.kind === "pipeline") {
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="wide-title">${title}${detail}</div><div class="pipeline">${[
      ["01", "FORECAST", "One member. One possible path."],
      ["02", "WIND", "Physical model → wind field."],
      ["03", "PEOPLE", "Boundaries × population estimates."],
    ]
      .map(
        ([n, h, d]) =>
          `<div class="pipe enter"><span class="step">${n}</span><h2>${h}</h2><p>${d}</p><div class="pipe-line"></div></div>`,
      )
      .join(
        "",
      )}</div><div class="formula enter"><span>EXPECTED EXPOSURE</span><b>Σ population × wind probability</b><small>Uncertainty: 10–90% range across forecast members</small></div><p class="source enter">Holland wind profile · UNFPA/BBS 2022 population totals · WorldPop 2020 allocation · model-derived estimates</p></div>`;
  } else if (s.kind === "capture") {
    cls = "product";
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="two-col"><div class="copy">${title}${detail}<div class="rule enter"></div><p class="micro enter">${esc(credits[s.id])}</p>${s.id === "union" ? '<div class="union-fact enter"><b>28%</b><span>Amadi · chance of ≥34 kt<br/>Remal T−24 archived cycle</span></div>' : ""}${s.id === "language" ? '<div class="bangla wordmark enter">ঘূর্ণি</div>' : ""}${s.id === "evidence" ? '<div class="evidence-fact enter"><b>6</b><span>STORMS<br/>3 LEAD TIMES</span></div>' : ""}</div><div class="product-stage"><div class="wide-capture enter" data-layout-allow-overflow><img src="assets/captures/${s.capture}" alt="Actual Ghurni ${s.id} workspace"/></div><div class="focus-capture enter" data-layout-allow-overflow><img src="assets/captures/${s.id}-detail.jpg" alt="Magnified actual application panel"/></div><div class="capture-label enter">ACTUAL APPLICATION · PANEL DETAIL</div></div></div><p class="source enter">${liveCaptures.has(s.id) ? liveSourceLine : sourceLine}</p></div>`;
  } else if (s.kind === "models" || s.kind === "impact") {
    const models = s.kind === "models";
    const rows = models
      ? [
          [
            "INPUT",
            "Reported cyclone fixes",
            "GDACS / JTWC position, timestamp and source",
          ],
          [
            "MODEL",
            "Kalman state estimation",
            "Updates position and motion from new observations",
          ],
          [
            "OUTPUT",
            "Position and uncertainty",
            "Between-fix estimates pause when fixes become stale",
          ],
        ]
      : [
          [
            "TARGET 1",
            "Under 5 minutes",
            "Median time to prepare a reviewable priority list",
          ],
          [
            "TARGET 2",
            "At least 90%",
            "Pilot users correctly identify when a fix is stale",
          ],
          [
            "NEXT",
            "Coastal pilot and validation",
            "Compare decisions with current workflows in both languages",
          ],
        ];
    const content = rows
      .map(
        ([label, heading, description]) =>
          `<div class="limit enter"><span class="step-label">${label}</span><div><h2>${heading}</h2><p>${description}</p></div></div>`,
      )
      .join("");
    const source = models
      ? "Open-Meteo provides regional model weather in a separate layer."
      : "Pilot targets are proposed success criteria. Shelter access and flood mapping are planned.";
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="two-col"><div class="copy">${title}${detail}</div><div class="limits-list">${content}</div></div><p class="source enter">${source}</p></div>`;
  } else if (s.kind === "team") {
    cls = "team";
    extra = `<div class="scene-content"><p class="eyebrow enter">${esc(s.eyebrow)}</p><div class="wide-title">${title}${detail}</div><div class="team-grid">${team.map(([n, r], k) => `<div class="person enter"><span class="person-index">0${k + 1}</span><h2>${n}</h2><p>${r}</p></div>`).join("")}</div><p class="source enter">Ghurni · Bangladesh</p></div>`;
  }
  return `<section id="scene-${s.id}" class="scene ${cls}" data-layout-allow-occlusion data-scene-start="${s.start}" data-scene-end="${s.end}" aria-label="${esc(s.title)}" style="z-index:${i + 1};${i ? "opacity:0;" : ""}"><div class="scene-grid" data-layout-ignore></div>${extra}</section>`;
}

// Captions use the speech engine's measured word boundaries, not guessed timing.
const captions = [];
for (const line of narration) {
  const scene = scenes.find((s) => s.id === line.id);
  const scriptWords = scene.voice.trim().split(/\s+/);
  const normalize = (word) => word.toLowerCase().replace(/[^a-z0-9]/g, "");
  const scriptMatches =
    scriptWords.length === line.words.length &&
    scriptWords.every(
      (word, i) => normalize(word) === normalize(line.words[i].text),
    );
  let current = [];
  line.words.forEach((word, i) => {
    const spoken = scriptMatches ? scriptWords[i] : word.text;
    const text = spoken.replaceAll("Ghoorni", "Ghurni");
    current.push({ ...word, text });
    const remaining = line.words.length - i - 1;
    const gap = remaining ? line.words[i + 1].start - word.end : 1;
    const phraseEnd = /[.!?]$/.test(spoken) || gap > 0.27;
    const longLine = current.length >= 8 && remaining >= 3;
    if (!remaining || longLine || (phraseEnd && current.length >= 3)) {
      captions.push({
        start: current[0].start,
        end: Math.min(
          scene.end - 0.05,
          Math.max(word.end + 0.14, current[0].start + 1.85),
        ),
        text: current.map((item) => item.text).join(" "),
      });
      current = [];
    }
  });
}
captions.forEach((c, i) => {
  if (captions[i + 1]) c.end = Math.min(c.end, captions[i + 1].start - 0.01);
});
const timecode = (t) => {
  const ms = Math.round(t * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const srt = captions
  .map(
    (c, i) =>
      `${i + 1}\n${timecode(c.start)} --> ${timecode(c.end)}\n${c.text}\n`,
  )
  .join("\n");
writeFileSync("captions.srt", srt);
writeFileSync(
  "captions.vtt",
  "WEBVTT\n\n" + srt.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2"),
);
writeFileSync(
  "transcript.json",
  JSON.stringify(
    narration.flatMap((n) =>
      n.words.map((w) => ({
        ...w,
        text: w.text === "Ghoorni" ? "Ghurni" : w.text,
      })),
    ),
    null,
    2,
  ),
);

const motions = [];
scenes.forEach((s, i) => {
  const q = `#scene-${s.id}`,
    start = s.start,
    d = s.end - s.start;
  if (i) {
    // Fade the outgoing copy before the incoming copy enters, then transition the background.
    const previous = `#scene-${scenes[i - 1].id}`;
    const wipe = ["title", "pipeline", "models", "impact", "team"].includes(
      s.kind,
    );
    motions.push(
      `tl.to('${previous} .scene-content',{opacity:0,duration:.18,ease:'sine.inOut'},${start});`,
    );
    motions.push(
      wipe
        ? `tl.fromTo('${q}',{opacity:1,x:1920},{opacity:1,x:0,duration:.42,ease:'power3.inOut',immediateRender:false},${start});`
        : `tl.to('${q}',{opacity:1,duration:.4,ease:'sine.inOut'},${start});`,
    );
    motions.push(`tl.set('${previous}',{opacity:0},${start + 0.43});`);
  }
  motions.push(
    `gsap.utils.toArray('${q} .enter').forEach((el,k)=>{const mode=k%4;tl.set(el,{opacity:0},${start});tl.fromTo(el,{opacity:0,x:mode===1?-22:mode===2?25:0,y:mode===0?24:0,scale:mode===3?.96:1},{opacity:1,x:0,y:0,scale:1,duration:[.65,.5,.75,.85][mode],ease:['power3.out','expo.out','sine.out','power2.out'][mode],immediateRender:false},${start + 0.2}+Math.min(k*.075,.45));});`,
  );
  if (s.kind === "tracks" || s.kind === "map")
    motions.push(
      `gsap.utils.toArray('${q} .forecast-trace').forEach((el,k)=>tl.fromTo(el,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:3.8,ease:'sine.inOut',immediateRender:false},${start + 1}+k*.045));`,
    );
  if (s.kind === "map")
    motions.push(
      `tl.to('${q} .map-graphic',{y:-14,duration:${d},ease:'sine.inOut'},${start + 0.2});`,
    );
  if (s.kind === "capture")
    motions.push(
      `tl.to('${q} .wide-capture img',{scale:1.045,x:-8,duration:${d - 0.5},ease:'sine.inOut'},${start + 0.4});`,
    );
  if (s.kind === "title" || s.kind === "close")
    motions.push(
      `tl.to('${q} .brand-rings',{rotation:24,scale:1.09,duration:${d},ease:'none'},${start});`,
    );
  if (s.kind === "pipeline")
    motions.push(
      `gsap.utils.toArray('${q} .pipe-line').forEach((el,k)=>tl.from(el,{scaleX:0,transformOrigin:'left center',duration:1.2,ease:'power2.out',immediateRender:false},${start + 1}+k*.8));`,
    );
});
for (let i = 0; i < 6; i++) {
  const t = 0.2 + i * 1.3;
  motions.push(
    `tl.fromTo('#montage-${i}',{opacity:0,rotation:${i % 2 ? 1.5 : -1.5},scale:1.08},{opacity:1,rotation:0,scale:1.02,duration:1.2,ease:'power2.out',immediateRender:false},${t});`,
  );
  if (i) motions.push(`tl.set('#montage-${i - 1}',{opacity:0},${t + 0.15});`);
}
motions.push(
  `tl.to('#scene-close',{opacity:0,duration:.55,ease:'power2.in'},179.45);`,
);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=1920"/><title>Ghurni — Before Landfall · 180 seconds</title>
<script src="assets/vendor/gsap.min.js"></script><link rel="stylesheet" href="film.css"/></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="180" data-width="1920" data-height="1080" data-fps="30">
${scenes.map(frame).join("\n")}
<div id="caption-band" data-layout-ignore></div>
${captions.map((c, i) => `<div id="caption-${i}" class="clip caption" ${attrs(c.start, c.end - c.start, 20)}><span>${esc(c.text)}</span></div>`).join("\n")}
<audio id="score" class="clip" src="assets/audio/before-landfall-score.mp3" ${attrs(0, 180, 30)} data-volume="0.8"></audio>
${narration.map((n) => `<audio id="vo-${n.id}" class="clip" src="${n.file}" ${attrs(n.start, n.duration, 31)} data-volume="1"></audio>`).join("\n")}
</div><script>window.__timelines=window.__timelines||{};var tl=gsap.timeline({paused:true});
${motions.join("\n")}
window.__timelines.main=tl;</script></body></html>`;
writeFileSync("index.html", html);
const script = [
  "# Ghurni — Before Landfall",
  "",
  "180 seconds · 1920×1080 · 30 fps · English narration + captions",
  "",
  ...scenes.flatMap((s) => [
    `## ${s.start}–${s.end}s — ${s.title}`,
    "",
    s.voice.replaceAll("Ghoorni", "Ghurni"),
    "",
    `Visual: ${s.kind}${s.capture ? " / actual application capture" : ""}. ${s.detail}`,
    "",
  ]),
].join("\n");
writeFileSync("SCRIPT.md", script);
for (const n of narration) {
  const s = scenes.find((s) => s.id === n.id);
  if (n.start + n.duration > s.end - 0.05)
    throw new Error("Voice crosses scene boundary: " + n.id);
  if (!existsSync(n.file)) throw new Error("Missing narration: " + n.file);
}
if (
  scenes[0].start !== 0 ||
  scenes.at(-1).end !== 180 ||
  scenes.some((s, i) => i && s.start !== scenes[i - 1].end)
)
  throw new Error("Film must be contiguous, exactly 180 seconds");
console.log(
  `Built ${scenes.length} scenes, ${captions.length} measured caption groups, ${narration.length} voice clips. Duration: exactly 180 seconds / 5400 frames.`,
);
