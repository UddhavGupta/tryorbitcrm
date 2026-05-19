# Elevate the aesthetics — landing + signed-in/demo

The current design is already warm and considered (Newsreader display, maroon primary, soft off-white). To push it into "elite editorial / quietly luxurious" territory, the moves are about **restraint, hierarchy, materials, and motion discipline** — not adding more.

Below is what I'd change, grouped by layer. I'll wait for your direction before touching code.

---

## 1. Type system — make it the centerpiece

Right now Newsreader is used for headlines only. Elite editorial sites lean harder on type contrast.

- **Display**: Keep Newsreader but increase optical size + tighten tracking (`-0.025em`) on hero/H1; introduce a true **drop-cap or oversized numeral** on section openers ("01 / Add people").
- **Eyebrows**: Replace uppercase Inter eyebrows with a small-caps Newsreader variant + thin hairline rule above. Feels Aesop / The Row, not SaaS.
- **Body**: Bump body line-height to 1.65 and max-width to ~62ch for marketing prose. Add `text-wrap: balance` on headlines, `text-wrap: pretty` on paragraphs.
- **Numerics**: Already have `num-tabular`. Extend it everywhere counts/dates appear in-app (Dashboard tiles, People list, Reminders).
- **Italic accents**: You already italicize the maroon word. Use that pattern more sparingly inside body copy for emphasis ("*who* matters, *when* to reach out").

## 2. Color & material — quieter, deeper

- **Background**: Shift the warm off-white from `24 25% 97%` to `30 22% 96%` (a hair more cream/less pink) for the landing; in-app keep neutral but introduce a **second surface tone** (`--card-elevated`) for modals and the dashboard's top tiles to add depth without shadow.
- **Primary**: The current maroon is great. Add a **deeper "ink maroon"** (`351 45% 18%`) for headings on the landing — feels like a luxury wine label vs. a brand color.
- **Accent metal**: Introduce a **brushed champagne/brass** token (`38 35% 62%`) used only for hairlines, dividers under section titles, and the orbit center ring. One restrained metallic note is what separates "premium" from "nice".
- **Shadows**: Replace lift shadows with **inset 1px highlight + soft long shadow** (e.g. `inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 24px 48px -28px hsl(24 30% 12% / 0.18)`). Gives surfaces a printed/letterpress feel.

## 3. Layout & rhythm

- **Wider gutters, narrower text**: Marketing sections at `max-w-5xl` with text columns at `max-w-2xl`. Generous negative space is the cheapest luxury signal.
- **Asymmetric section openers**: Eyebrow + headline left-aligned with a thin vertical maroon rule, rather than centered. Centered-everything reads SaaS-template; asymmetry reads editorial.
- **Hairline dividers**: Replace gradient `divider-hairline` with a **single 1px brass line, 64px wide, left-aligned** at section starts. Much more "magazine".
- **Footer**: Reduce link weight, add a closing pull-quote or signature mark above the legal row.

## 4. Hero — pull it back

- Remove the pulsing dot badge ("Personal CRM, reimagined") OR replace with a quiet small-caps eyebrow.
- Trim the aurora blob opacity ~40%; let the type carry weight.
- Buttons: Replace gradient primary with **solid ink-maroon + 1px inner highlight**; outline button gets a hairline brass underline on hover instead of a fill. Less candy, more couture.

## 5. Orbit constellation

- Switch dot fill to a **soft cream** with a thin maroon ring; active dot fills with maroon and gets a brass halo. Currently feels techy; this makes it feel like an enamel pin / planetary chart.
- Orbit rings: dashed → very fine solid hairlines in brass at 25% opacity.
- Center label: set in Newsreader italic, not Inter.

## 6. Signed-in app & demo

The app currently leans utilitarian. Elevation moves:

- **PageHeader**: Title in Newsreader (display-md), kicker eyebrow above in brass small-caps, action buttons aligned to a baseline grid with hairline separator below the header.
- **Dashboard tiles**: Drop the colored status pills onto **bone-white cards with a single colored left rule** (4px maroon/amber/success). Cleaner, more dossier-like.
- **People list rows**: Increase row height to 64px, avatar becomes a circle with a 1px brass ring on hover, name in Newsreader, meta in Inter small-caps. Hover reveals a thin maroon underline under the name.
- **Empty states**: Replace illustrations with a single italic Newsreader line + one brass hairline. Less Notion, more Aesop.
- **Modals (ContactDialog etc.)**: Soft cream background, brass hairline header divider, primary action right-aligned with a quiet outline secondary on the left. Lose any drop shadows in favor of a thin border + backdrop blur.
- **Tour**: Tooltip in cream with a brass corner accent and Newsreader headline per step.

## 7. Motion — discipline over delight

- Remove `animate-pulse` on the badge dot.
- All reveal animations: slow to 600ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, translate distance 4px (currently 6px). Quieter = more confident.
- Add a **0.2s fade between route transitions** in `AppLayout` so the signed-in experience feels stitched together.
- Hover lifts on cards: drop from `-1px translate` to **border color shift + subtle inner highlight**. Lifting is a SaaS tell.

## 8. Small finishing details

- **Favicon/logo**: Confirm Didot logo renders with optical kerning — consider a custom SVG wordmark with a small brass dot between "Orbit" and "CRM".
- **Cursor**: On the landing only, use a slightly larger, custom CSS cursor on interactive cards (subtle, 16px circle).
- **Image treatment**: Any product screenshots inside the carousel get a 1px brass border + cream matte frame (like a gallery print).
- **Microcopy**: Replace "Try the demo" / "Start free" with quieter verbs: "Enter the demo" / "Begin". Small but signals confidence.

---

## Suggested rollout (if you want all of it)

1. **Tokens & type** (index.css, tailwind.config.ts) — new brass token, ink-maroon, refined shadows, body line-height, eyebrow restyle.
2. **Landing pass** — hero, orbit, section openers, footer, buttons.
3. **App shell** — PageHeader, card surfaces, modal chrome, list rows.
4. **Motion audit** — slow + soften globally, route fades.

---

## What I need from you

Pick any combination — I can do the full pass, or scope down. A few decision points worth flagging:

- **Brass accent**: yes/no? It's the single biggest "luxury" lever but it's a commitment.
- **Landing only, or app too?** App changes are higher-impact for signed-in users but touch many components.
- **Keep gradient primary buttons** or move to solid ink-maroon?
- **Centered vs. asymmetric** section headers on landing?

Tell me which of the eight sections to pursue (or "all of it") and I'll implement.
