# VinoFact bottle images are copied into Sanity once, keeping existing alt texts

Status: accepted
Date: 2026-11-14 (released in core-back 6.2.0 with core-front 5.2.0)

## Context

Wine shops wanted VinoFact's bottle shots as product images (several shops
use VinoFact). The owner wants product images hosted on Sanity, not loaded from i.vinofact.com
at page view. Downloading in the Studio needs CORS: VinoFact's image server (`/r/`, nginx +
imgproxy) sent no `Access-Control-Allow-Origin` until VinoFact #922 added `*` for `/r/` only — no
OPTIONS handling, no credentials. Editors may already have written alt texts on a variant's image.

## Decision

- **One-off copy, no sync:** the import uploads the bottle shot as an ordinary Sanity asset and sets
  the variant's `image`; a new shot in VinoFact needs a click on "neu übernehmen". The schema.org
  fallback to the VinoFact image was removed from core-front at the same time.
- **Plain `fetch(url)`** of the `/r/` URL — no custom headers, no credentials — so the browser sends
  a simple CORS request without preflight (the VinoFact GraphQL client's `fetchData` is not reused:
  it sends `Authorization` + JSON content type). No proxy function.
- **Existing alts win** (owner, 2026-11-14): per content locale a non-blank alt is kept, VinoFact's
  alt fills only empty locales. We can't tell an editor's alt from one a previous import wrote, so
  to take VinoFact's current alt the editor clears the field first. Crop/hotspot are reset (they
  belong to the old image).
- Bulk paths (product action, Product Manager) patch the variant's draft when one exists, else the
  published document — `productVariant` isn't `liveEdit`, and a patch to published under a draft
  would be lost on publish.

## Consequences

- Images get crop, hotspot, CDN and the `image` shortcode like any Sanity image; replaced assets stay
  in the media library (no cleanup; re-uploading the same file is deduped by SHA-1).
- A bottle shot changed in VinoFact is not followed automatically.
- The import depends on #922's CORS header staying on `/r/`.
