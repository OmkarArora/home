# Design lab: the versions that lost

The redesign started as three home pages built from one content file
(`src/content/profile.ts`). Version A, "Patch notes", won and lives on at
`src/app/lab/a`. These two are kept for reference: not built, not routed, and
excluded from `tsconfig.json`, so nothing here can break the site.

| | Version | Idea | Why it lost |
|---|---|---|---|
| `b/` | **Editorial** | Instrument Serif, Archivo and IBM Plex Mono, with a vermilion accent. Numbered sections, ixigo work as an index table. | Felt cramped. The whitespace didn't breathe. |
| `c/` | **Panels** | Anton, Manrope and Space Mono, with a manga red accent. Ink-bordered panels, screentone, a speech bubble. | Fun, but too information-dense. |

Both render exactly as they did in commit `f2fd53c` ("feat: design lab with
three candidate home pages"). That commit's Vercel preview showed them at
`/lab/b` and `/lab/c`.

## Bringing one back

Move the folder back to `src/app/lab/<letter>/`. Each version is a `layout.tsx`
(fonts and palette, scoped by `data-lab`) and a `page.tsx`. It may need small
fixes if `profile.ts` has changed shape since.
