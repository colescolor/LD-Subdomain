# Asset provenance

No Latch implementation, branding or assets are included.

## User-supplied Lockdowel material

Copied from `C:\Users\Owner\Downloads` under the user's authorization:

- `Lockdowel-E3259BM-Align-Seat-Slide-1080p.mp4` → `e3259bm-align-seat-slide.mp4`. Original file unchanged. SHA-256: `4E54490F6AFB5427C327D1F8403FE073C7DF1FF3CF88447DFABBA923B88A9E01`.
- `Lockdowel-Showcase-1-Simple-Table.pdf` → `boat-table-drawing.pdf`.
- `Lockdowel-Showcase-02-Open-Cubby.pdf` → `open-cubby-drawing.pdf`.
- `Lockdowel-Showcase-3-Angled-Table.pdf` → `angled-table-drawing.pdf`.

The drawings identify themselves as concept demonstrations, not CNC instructions. `*-sheet.png` and `*-exploded.png` are renders of pages 1 and 2 using PyMuPDF. `video-poster.jpg` is a frame at 32 seconds from the original video, showing the correct align/seat/slide segment.

## Existing public Lockdowel brand and photography

Copied from the existing LD Website local assets; their published source is Lockdowel.com:

- `lockdowel-logo.png`, `favicon.png`: official existing brand assets.
- `furniture.jpg`: https://lockdowel.com/wp-content/uploads/2026/03/Kimball-office-space-RGB-768x476.jpg
- `cabinetry.jpg`: https://lockdowel.com/wp-content/uploads/2024/07/Bella-complete-kitchen-gray-and-white_CMYK-e1722605928800-300x187.jpg
- `wall-panels.png`: https://lockdowel.com/wp-content/uploads/2024/07/Wall-Panel-4-460x295-1-e1723057318570.png

These are contextual photos from the main website, not renderings of the supplied concept drawings. Recheck publication rights before wider release.

## Original work and third-party libraries

- `src/scene.js`: independently authored Three.js model from the boat-table drawing's component dimensions, with a procedural timber texture and simplified neon-green fittings. No animator source was copied. Separation is an inspection view, not the source drawing's manufacturing assembly sequence.
- Three.js 0.185.1 installed directly from npm; MIT license copied into the build.
- Geist font copied from the main website with its SIL Open Font License (`FONT-LICENSE.txt`).
- Layout, CSS, browser interactions, static page templates, and local build/server scripts are original for this repository.

## Content references reviewed

- https://lockdowel.com/
- https://lockdowel.com/product-list/
- https://lockdowel.com/evaluation-kits/
- https://lockdowel.com/furniture/
- https://lockdowel.com/cabinetry/
- https://lockdowel.com/wall-panels/

The prototype does not copy the main site's numerical time-saving or structural-performance claims. The calculator's initial numbers are explicitly illustrative.

## E3259BM homepage close-up

- `public/assets/e3259bm-mesh.json`: the existing local manufacturer STEP tessellation from `../LAD/lockdowel-animator/.catalog/step-models/E3259BM.json`, used for the user's explicitly requested actual channel-lock showcase. The positions, normals, and triangle indices are unchanged. The browser applies a rigid 90-degree X rotation. 744 vertices / 692 triangles. Original STEP SHA-256: `838051f7d26acb8e08706cb9b4942ac34579ac58a99cc16e2aaf9e7c069274de`; copied JSON SHA-256: `85522454EB005602CC904699BCFB50BDCDF4AAAEB2C5DA102DF92C7FF796D84F`.
- `src/connector-detail.js`: preserves the CAD bridge and 5 mm post envelope; replaces the smooth presentation posts with six illustrative retention ridges, smooth lower shanks, and rounded lead-ins based on the user-supplied connector photo. These additions are not manufacturer CAD or measured tooling data.
- `public/assets/connector-wordmark.json`: smooth line and cubic Bezier outlines of LOCKDOWEL, redrawn with Arial Bold for shallow, beveled 3D lettering on the bridge. Replaces the jagged low-resolution bitmap trace; this is illustrative molding, not the exact official logo artwork.
- `public/assets/e3259bm-preview.png`: screenshot of the detailed presentation model in the locally authored Three.js viewer, used as the no-WebGL/no-JavaScript fallback.
- Green is presentation highlighting. Timber texture, mounting bores, receiving channel and movements are authored visual explanations. The final shot stays on the same two-panel cutaway; the former cabinet reveal is no longer used. They are not certified tooling data or an approved assembly specification.
- No Storkcraft customer drawing, model, or source-sheet image is included in this change.


## 3D parts library / 2026-10-04

- Inventory and 43 original reference photographs: https://lockdowel.com/elementor-37341/. Product-photo source URLs are recorded individually in `public/assets/parts/catalog.json`; image files are copied without modification. The purchasing storefront redirects to account login, so this inventory covers the public product showcase, not all size-specific purchase variants.
- `src/parts-geometry.js`: independently authored illustrative meshes for 21 photo-referenced parts, including channel locks, H-clips, housings, pins, and spring pins. Dimensions used to construct those meshes are visual estimates except where explicitly present in product names. Internal geometry is illustrative and not tooling data.
- E3259BM reuses the existing CAD-based, detailed homepage connector with a metal presentation finish. It is labeled CAD + detail.
- `7000-short.json` and `8002-40-R5.json`: unchanged copies from `../LAD/lockdowel-animator/.catalog/step-models/`. 7000 is explicitly labeled as the available Short CAD variant, not assumed to match the store photo's length.
- `vendor/RoomEnvironment.js`: copied during build from the installed Three.js examples, with only its module import redirected to the locally served Three.js bundle. Covered by the existing Three.js MIT license.
- Catalog discrepancies: the LDST shelf-system photo has an E900BP-8 caption on the public store; the library identifies it from the photo filename and published catalog listing and preserves a note. E4005 has no product image; the E4008 image filename identifies a different cutter, so neither is presented as a verified product photograph. Three drawer-slide families lack size-specific SKUs in the public listing; no identifiers are invented.
- Copied file SHA-256, `7000-short.json`: `bb37ea44b3df4005ec986861732a98b761c22333f1380763052e87fb0f4fc69c`.
- Copied file SHA-256, `8002-40-R5.json`: `1d6917f053a552ebe83465ad87d606f77a090075094e5207733da305fe6e06e7`.
