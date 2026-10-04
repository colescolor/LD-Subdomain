# SCR36 local landing page

Open http://127.0.0.1:4173/projects/scr36/ with the standalone preview, or use /projects/scr36/ on the orchestrator-managed subdomain server (normally port 3033).

The page is isolated in `public/projects/scr36/` to allow concurrent editing of the main site. The existing build copies it into `dist/projects/scr36/`; no shared templates, styles, scripts, dependencies, navigation, or build configuration were changed for this page. It is linked directly rather than inserted into the shared drawing library. It remains noindex, including production builds, and the existing production robots rule excludes `/projects/`.

## Edit

- `index.html`: standalone page, metadata, resource links, initial assembly chapter.
- `scr36.css`: page-specific responsive styles; reuses the existing local Geist font.
- `scr36.js`: six assembly chapter summaries and a Three.js illustrative model; imports the existing `/vendor/three.module.js`.

Run `npm run build` after edits and refresh. Do not edit generated `dist/` files. This page has no backend, external runtime requests, hosting registration, or deployment. No commit was created.

## Source assets

User-supplied files, copied unchanged from Downloads on October 4, 2026:

- `SCR36.pdf` -> `SCR36.pdf` (9 sheets).
- `Lazy Susan_SCR36 Instruction Manual 2026 06 25.xlsx` -> `SCR36-instruction-manual-2026-06-25.xlsx`.

`drawing-sheet.png` is a rendered first PDF sheet. `cabinet-drawing.png` is its perspective detail crop. Workbook media extracted without alteration: image2 -> manual-parts.png; image5 -> manual-base.png; image8 -> manual-tray.png; image9 -> manual-frame.png; image6 -> manual-route.png. These source materials are used only in this local presentation; public distribution rights have not been separately established.

The 3D cabinet is hand-authored illustrative geometry, not a CAD conversion or machining model. It shows a corner footprint, two trays, frame/fronts, toekick, and illustrative connector locations. The explosion separates components for inspection; it is not a simulation of the manual's engagement movements. The six assembly summaries follow the workbook and explicitly retain its unresolved routing, spring-pin, and face-frame correction notes.

## Verification

- The initial `npm run build` and all six existing `npm run check` tests passed. The final full-site build was blocked by a concurrent Storkcraft asset gate (missing `storkcraft-model.json`). Shared code was left untouched. The final SCR36 preview was refreshed with the same static-copy operation, limited to `public/projects/scr36/` -> `dist/projects/scr36/`, and its browser checks passed again.
- Headless Chromium rendered the WebGL model and verified assembled/exploded/X-ray controls, separation slider, rotation/reset, all six chapters, chapter pagination, and local assets/downloads.
- Desktop and 390/720/1024 px responsive layouts checked; no horizontal overflow.
- Reduced-motion, JavaScript-disabled content, and failed-3D-import fallback checked. Chapter controls continue working when the model cannot load.
- Desktop/mobile screenshots reviewed. No JavaScript errors in the tested browser flow.

The existing server on port 4173 was reused; no server was stopped or replaced. Concurrent user files remained untouched.

## Password-protected sales presentation

The new sales presentation is `/projects/scr36/preview/`. Its access gate also protects the existing SCR36 study and all source files in this folder, to prevent a direct drawing or video link bypassing access. The earlier study content and geometry are preserved. The gate runs in the local server and Vercel middleware; see the README's SCR36 sales presentation section for session-secret setup before deployment.
