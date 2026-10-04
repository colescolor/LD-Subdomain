# Lockdowel Subdomain

An independent site for **build.lockdowel.com**, with a local preview and Vercel deployment configuration. The public-facing identity is **Lockdowel Build — The Connection Studio**.


## Connector homepage

The homepage leads with the green E900BP nylon reference model, including thicker molded lower shanks and a raised Lockdowel wordmark. Three square, live 3D previews select E900BP, the silver E3259BM metal mini, or E910BP in the large viewer. E3259BM has seven bridge holes and no logo; it is no longer presented as the green nylon part. The 16-second assembly sequence keeps the selected E900BP, E3259BM, or E910BP model. Its bore sizes, bore depths, and receiving channel adapt to that model’s presentation geometry. Selection, replay, chapter navigation, and scrubbing preserve the part identity; Reset returns to inspection of the same part. E3259BM retains the source CAD mounting envelope. Its barbs and perforated bridge are illustrative reconstructions from the store reference. The sequence inserts once, seats, slides, and pulls back around the same finished joint. Warm beige and slate panels, stable shadows, cutaways, orbit, pause, reset, and scrubbing remain. Finishing reveals “Go see the full library.” Design imagery follows the 3D introduction in the left column. No storefront photos appear on the homepage.

On desktop, the stage occupies the right half of the viewport and stays pinned below the persistent navigation. The left column moves from a compact introduction into the 3D parts library, illustrated design studies, application and planning resources, and a project invitation. Scrolling does not change playback. On mobile the model appears after the introduction and scrolls naturally so it does not obscure the page previews; the navigation remains pinned with a scrollable menu. Reduced-motion preferences disable the initial spin; manual controls remain usable. Rendering pauses offscreen and in background tabs. A link to the original film appears when the model cannot load.

The Storkcraft draft files are preserved in `src/storkcraft*`, outside active navigation and builds. No customer-source assets were copied. Its earlier missing-asset build block is removed because the homepage is now an independent product-hardware experience.

New active files: `src/channel-home.mjs`, `src/channel-home.css`, `src/channel-home.js`, `src/channel-geometry.js`, `src/connector-detail.js`. The original CAD JSON is preserved unchanged; the metal renderer rebuilds the bridge with seven through-holes and replaces the smooth posts within their original mounting envelope. The nylon reference model has its own wider proportions and wordmark. Wood, routing, and travel are authored illustrations, not production specifications.

Validation covers the build, integration checks, and geometry checks. Geometry checks cover the CAD envelope, bores, retaining lips, ridges, seven metal bridge holes with no wordmark, a single insertion, safe perspective framing, and an invariant locked joint throughout the ending. Local browser verification covers desktop/mobile rendering, continuous playback, scrubbing backward and forward through the final shot, orbit controls, and no-JavaScript fallback. The previous cabinet and dissolve are removed from the active sequence.

## Run locally

Double-click `Start Local Preview.cmd`, or run these commands in this folder:

```powershell
npm install
npm run dev
```

Open **http://127.0.0.1:4173**. The server runs in the foreground; Ctrl+C stops it. It binds to this computer only. There is no daemon. The Git remote is https://github.com/colescolor/LD-Subdomain.git; vercel.json defines the static build and output directory. Domain configuration remains in Vercel/DNS.

`npm run dev` rebuilds the static pages before serving. After editing source, run `npm run build` in another terminal and refresh. This small server does not watch source files automatically.

## The experience

- `/` — three selectable 3D connector close-ups, a pinned interactive stage, selected-part mounting/locking sequence, and finished-joint overview.
- `/explore/` — keyboard-accessible application explorer for furniture, cabinetry and wall panels, leading to relevant main-site pages.
- `/drawings/` — a study index whose cards open dedicated HTML pages.
- `/drawings/boat-table/`, `/drawings/open-cubby/`, `/drawings/angled-table/` — finished/exploded drawing views, overview, next step and explicit PDF download.
- `/guides/` — three source-linked technical guides covering channel locks, E3259BM assembly, and cabinet assembly planning.
- `/start-project/` — a project inquiry form with optional drawing, downloadable brief, and server-validated delivery once a receiving service is configured.
- `/how-to/e3259bm/` — the unchanged supplied 40-second video, playback controls, and written overview.
- `/projects/boat-table/` — hand-authored sample project presentation with drawing, interactive overview, review notes, and a separate connector-video example.
- `/savings/` — assembly labor scenario calculator with explicit assumptions and a downloadable text result.

The header’s Online Store button points to the store entry on Lockdowel.com. Product, evaluation-kit, and contact calls to action return to the main website.

## Source organization

- `src/pages.mjs`: complete static page content, navigation, metadata, and page templates.
- `src/styles.css`: responsive styling and reduced-motion behavior.
- `src/channel-home.*` and `src/channel-geometry.js`: featured connector story, CAD viewer, and illustrative assembly geometry.
- `src/scene.js`: existing boat-table study, camera shots, joint close-up and interactions.
- `src/receiver-geometry.js`: layered routed cavities with narrow mouths, wider receiving pockets and retaining lips.
- `src/app.js`: browser interactions and application content.
- `src/calculator.js`: validated scenario arithmetic.
- `content/projects.mjs`: reviewed drawing inventory and sample project content.
- `public/assets/`: self-contained media with provenance in `ASSETS.md`.
- `scripts/build.mjs`: writes portable static output to `dist/`.
- `scripts/serve.mjs`: local foreground server with video byte-range support.
- `scripts/check.test.mjs`: meaningful integrity and behavior checks.

The npm dependencies are the official Three.js library and Vercel Analytics SDK. The build copies their browser modules and licenses into `dist/vendor/`. Analytics stays disabled until configured. No runtime CDN dependency or connection to the main repository is needed. The original site implementation was written independently; no Latch source, branding, or assets were used.

## Hand-created project pages

The sample demonstrates a curated landing page rather than an automated customer portal. Add reviewed content to `content/projects.mjs`, then add a page/template entry in `src/pages.mjs` with a unique title, description and route. Include the approved drawing, optional authorized video, revision, assumptions and next step. Rebuild to produce real HTML.

Keep project entries marked `private: true` for noindex metadata and sitemap exclusion. That flag is **not authentication**. Before hosting confidential material, introduce actual access control covering both the page and its files. This local prototype contains demonstration drawings only, no customer account system or client secrets. The copy-link action copies a localhost URL, which works only on this computer.

## SEO and AI discovery

Every page has complete HTML content without needing JavaScript, a unique title and description, an intended-domain canonical, and WebPage structured data referencing Lockdowel. The site uses semantic headings, meaningful links, local fonts, responsive layouts, image dimensions, and lazy loading below the fold. The 3D code loads only on pages with a model. Video does not autoplay or download in full on the homepage.

**Preview is noindex by default.** `npm run build` emits noindex metadata and an empty sitemap. Crawling is allowed so search engines can read noindex directives. The localhost server additionally sends a noindex header. Nothing can rank while it remains a local preview.

Vercel production builds automatically switch public pages to index/follow and create a sitemap at SITE_URL (default https://build.lockdowel.com). Vercel previews remain noindex. Locally, `node scripts/build.mjs --production` explicitly produces production metadata. Sample project pages remain noindex and excluded. This is a file build, not a deployment. Do not use the local development server as production hosting; it intentionally always sends noindex.

Before any real launch: review brand and technical copy, confirm image rights, review project visibility, verify final URLs and canonical domain, add the public site's reporting/consent requirements, validate rendered structured data, and test on real desktop/mobile browsers. There is no ranking guarantee and no simulated AI assistant. The useful foundation is structured, accessible product information; a grounded assistant can be added separately when its content and service integration are approved.

## Validation

```powershell
npm run build
npm run check
```

Checks cover calculator positive/negative/zero/invalid inputs, HTML and local asset integrity, noindex defaults, structured-data parsing, production metadata switching, live loopback routes, 404 status, path rejection, video byte ranges and PDF delivery. Syntax checks were also run for browser scripts.

The source video and copied video have identical SHA-256 hashes. The new homepage has completed desktop/mobile browser checks and screenshot review as described above. Earlier concept pages have not received a fresh browser visual review in this revision.

## Boundaries of this version

The inquiry API can forward a validated project brief and optional drawing to a configured HTTPS receiver; delivery is unavailable until that service is connected. There is no content editor, login, email verification, public upload library, or AI chat. The calculator stays browser-local. Analytics and inquiry delivery are opt-in deployment integrations. See [SEO and inquiry setup](docs/seo-release.md) and [.env.example](.env.example) for activation and verification.

The homepage distinguishes the nylon E900BP and E910BP reference models from E3259BM. The metal E3259BM uses the CAD mounting envelope, photo-derived barbed posts, rounded tips, and a reconstructed perforated bridge without branding. The source CAD asset remains unchanged; these surface details are illustrative. Hardware in the older boat-table study remains simplified. Geometry and movements are not a CNC file, engineering validation, or installation instruction. The separate E3259BM video does not validate its compatibility with the table concept.

## Navigation and geometry revision

The homepage now leads with Play the connection, followed by application and project links. A persistent journey navigation and revised header connect all internal destinations. Source PDFs are secondary downloads on design-study pages, rather than the result of clicking a study card. The project page remains `/projects/boat-table/`.

Receiving features are constructed as actual layered mesh openings and recessed pockets, not overlays on flat panels. Raycast tests verify all eight receivers and their retaining lips. Hardware and machining profiles remain illustrative rather than engineering specifications. The Joint detail control focuses on a receiving pocket. Cinematic home shots change every three seconds, while the project overview cycle is four seconds. Motion can be paused and reduced-motion preferences are respected.

The SEO release adds four guide routes to the templated HTML pages, alongside any separately authored project pages. Homepage browser verification is recorded above.


## 3D parts library

`/parts/` provides 24 interactive models across 43 public storefront listings checked on 2026-10-04. It includes SKU/name search, family and 3D/all filters, independent photo comparison, copyable part numbers, deep links, drag/keyboard orbit, zoom, spin/pause, reset, and mobile navigation back to the catalog. The selected model uses one WebGL viewer; a second shared renderer paints the visible mini 3D canvases, avoiding a context per card. Previews load on demand, pause offscreen, and honor reduced motion. Replaced inspector geometry/materials are disposed. Gallery cards contain model views, while reference photos require an explicit secondary selection. Motion respects the site control, reduced-motion preferences, visibility, and background tabs.

`public/assets/parts/catalog.json` owns the catalog and source URLs. Two models use unchanged manufacturer STEP tessellations (7000 Short and 8002-40-R5); E3259BM uses the CAD mounting envelope with a photo-derived perforated bridge and barbs; 21 other models are photo-based visual references. Each selection labels its basis. The remaining 19 listings show reference information rather than invented 3D geometry. Drawer-slide listings without a published SKU say the number varies by size. Two missing/mismatched tooling photos are not displayed as verified product references.

The library uses the existing Three.js dependency and its MIT-licensed RoomEnvironment for studio reflections. The renderer and geometry live in `src/parts-library.js` and `src/parts-geometry.js`; static HTML and responsive layout live in `src/parts-page.mjs` and `src/parts-library.css`. Original source photos are local; browsing does not call the storefront or require an account.

Validation includes all 24 mesh bounds/normals, genuinely hollow housings and bridge openings, CAD identities, source links and asset availability. Browser checks cover every model, filters and normalized part-number search, photo toggle, spin/orbit/zoom, deep links, desktop/mobile layout, no-JavaScript browsing, and WebGL fallback. No pricing, availability, compatibility, or production dimensional accuracy is inferred from these presentation models.

Model-first revision validation: all 24 mini previews render, the three homepage selections update the full-size view and SKU, the assembly retains the selected part and identifies its SKU, and the completed sequence exposes its library link. Gallery cards have no product photos. Reference imagery is opt-in; unavailable models retain text and documentation links.
