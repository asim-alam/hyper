import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("../../", import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root)));
const storm = read("app/public/data/storms/remal-2024.json");
const land = read("app/public/data/geo/land.json");
const districts = read("app/public/data/geo/districts.json");
const xy = (lon, lat) => [
  ((lon - 84.5) / 11.5) * 1120,
  ((28 - lat) / 15) * 840,
];
function geom(g) {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polys
    .map((p) =>
      p
        .map(
          (r) =>
            r
              .filter((_, i) => i % 3 === 0 || i === r.length - 1)
              .map(([a, b], i) => {
                const [x, y] = xy(a, b);
                return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ") + "Z",
        )
        .join(" "),
    )
    .join(" ");
}
const base =
  land.features
    .map(
      (f) =>
        `<path d="${geom(f.geometry)}" fill="#123139" stroke="#397273" stroke-width="1"/>`,
    )
    .join("") +
  districts.features
    .map(
      (f) =>
        `<path d="${geom(f.geometry)}" fill="#16423f" stroke="#69a79d" stroke-width=".6"/>`,
    )
    .join("");
const route = (points) =>
  points
    .map(([, lat, lon], i) => {
      const [x, y] = xy(lon, lat);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
const labels =
  '<g fill="#f5ead8" font-family="monospace" font-size="21"><text x="480" y="170">BANGLADESH</text><text x="360" y="650">BAY OF BENGAL</text><text x="40" y="260">INDIA</text></g>';
const board = (tracks) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 840"><rect width="1120" height="840" fill="#071b20"/>${base}${tracks}${labels}</svg>`;
const earlyLead = storm.leads["72"];
const baseline = earlyLead.deterministic[earlyLead.baseline];
const singleTrack = `<path class="forecast-trace" d="${route(baseline.pts)}" fill="none" stroke="#ffb078" stroke-width="4" stroke-linecap="round" pathLength="1"/>`;
writeFileSync(
  new URL("../assets/graphics/forecast-single.svg", import.meta.url),
  board(singleTrack),
);
for (const lead of ["72", "48", "24"]) {
  const members = storm.leads[lead].members;
  const traces = members
    .map(
      (m, i) =>
        `<path class="forecast-trace" d="${route(m.pts)}" fill="none" stroke="${i % 3 === 0 ? "#ffb078" : "#80c7ba"}" opacity=".46" stroke-width="1.8" pathLength="1"/>`,
    )
    .join("");
  writeFileSync(
    new URL(`../assets/graphics/forecast-${lead}.svg`, import.meta.url),
    board(traces),
  );
}
const modes = Object.fromEntries(
  ["72", "48", "24"].map((lead) => [
    lead,
    {
      issue: storm.leads[lead].init,
      members: storm.leads[lead].n,
      exposure: storm.leads[lead].modes.trend.exposure["34"],
    },
  ]),
);
writeFileSync(
  new URL("../assets/graphics/data-facts.json", import.meta.url),
  JSON.stringify(
    {
      storm: storm.id,
      modes,
      source: "app/public/data/storms/remal-2024.json",
      note: "Archived forecast geometry and model-derived exposure. Equirectangular editorial projection.",
    },
    null,
    2,
  ),
);
console.log(
  "Generated forecast maps from archived single-model and ensemble tracks.",
);
