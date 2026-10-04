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
- `public/assets/e3259bm-preview.png`: screenshot of that mesh in the locally authored Three.js viewer, used as the no-WebGL/no-JavaScript fallback.
- Green is presentation highlighting. Timber texture, mounting bores, receiving channel, movements, and cabinet are authored visual explanations. They are not certified tooling data or an approved assembly specification.
- No Storkcraft customer drawing, model, or source-sheet image is included in this change.
