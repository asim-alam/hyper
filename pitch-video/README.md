# Ghurni — Before Landfall

A 180-second competition pitch in 1920 × 1080 at 30 fps. The composition includes English narration, in-frame English captions, and an original instrumental score. Illustrated forecast paths use archived Remal ensemble tracks. The product walkthrough uses captures of the Ghurni prototype.

Open this directory as a Hyperframes project. `index.html` is the entry point, and all media, fonts, and animation code it references are bundled. Render on the server with Hyperframes, Chrome, and FFmpeg available.

```sh
npm run dev
npm run render -- --fps 30 --quality high --output ghurni-before-landfall.mp4
```

Use `npm run build` to regenerate the composition, script, and subtitle files from `scenes.json`, `narration.json`, and the bundled forecast data. If you replace narration, update its timestamps in `narration.json` or regenerate it with `scripts/voice.py`, then regenerate the music mix with `node scripts/score.mjs`. `scripts/graphics.mjs` regenerates the map diagrams from Ghurni's application data when this project sits alongside the repository's `app` directory.

`captions.srt` and `captions.vtt` provide separate subtitle tracks. `SCRIPT.md` lists the 15 scenes and their narration. The composition uses a pronunciation spelling for Ghurni in the speech input and the published spelling in its captions.

The supplied Mission Control Jr film informed the opening montage, rust palette, condensed typography, and rhythm. The voice is Microsoft Edge's stock Ava Neural voice. The score is synthesized by `scripts/score.mjs`.

Forecast tracks come from UCAR RAL a-decks for GEFS, GEPS, and NAVGEM-E. Geographic data comes from geoBoundaries and BBS–OCHA. Exposure estimates use UNFPA/BBS population totals and WorldPop. Application captures contain EOxCloudless 2024 imagery by EOX IT Services GmbH, comprising modified Copernicus Sentinel data under CC BY-NC-SA 4.0, alongside OpenFreeMap and OpenStreetMap contributor data. Full provenance appears in Ghurni's Evidence workspace.
