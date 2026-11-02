# Texture masks

One SVG per texture, used as a `mask-image` by `src/styles/_textures.scss`.
To add one, put the file here and add a line to that file's `$textures` map.
Editing a file needs no stylesheet rebuild.

Each file must follow four rules:

- Draw in opaque black on a transparent ground. `mask-mode: match-source` on
  an `.svg` file uses alpha, so white areas are holes.
- Tile seamlessly: a shape crossing an edge repeats on the opposite edge. For
  `feTurbulence`, use `stitchTiles="stitch"` and pin the filter region to the
  tile with `filterUnits="userSpaceOnUse"`, because the default region is 10%
  larger than the element on every side.
- Use a square `viewBox` starting at the origin, matching the entry's `tile`.
- No scripts and no external references. An SVG used as an image renders in
  secure static mode and drops both. Filters, gradients and patterns work.

Each map entry has three values:

- `tile`: the natural square size it repeats at, before `--s99ab-tex-scale`.
- `weight`: normalises its strength against the other textures, so plane
  strengths do not need retuning per texture.
- `repeat`: `no-repeat` for a texture that scales to the surface instead of
  tiling.

`tests/texture-files.spec.ts` checks the four rules. `tests/texture-styles.spec.ts`
and `tests/texture.spec.ts` check that this directory, the `$textures` map and
the `TEXTURES` catalogue in `src/composables/appearance/useTexture.ts` name the
same set.
