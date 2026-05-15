## Replace image logo with text wordmark

Remove the `orbitcrm-logo.png` image from every surface and replace it with a text-based wordmark: the word **OrbitCRM** set in Didot (with Bodoni as fallback), black color.

### Approach

1. **Add the font** — Didot/Bodoni aren't web-safe, so load Bodoni Moda from Google Fonts in `index.html` as a reliable web-available stand-in for Didot's high-contrast serif look. Define a `font-logo` family in `tailwind.config.ts` with the stack: `"Didot", "Bodoni Moda", "Bodoni 72", serif`. Native Didot/Bodoni will be used on macOS/iOS; Bodoni Moda on every other device.

2. **Create a `<Logo />` component** at `src/components/Logo.tsx` — a single source of truth that renders:
   ```tsx
   <span className="font-logo font-semibold tracking-tight text-foreground">OrbitCRM</span>
   ```
   Accepts a `className` prop so each call site can size it (e.g. `text-xl`, `text-2xl`). Uses `text-foreground` (near-black in the current theme) so it adapts cleanly; if you'd rather force pure `#000`, swap to `text-black`.

3. **Replace every `<img src={logo} />`** in these files with `<Logo className="..." />`, sized to roughly match the current image height:
   - `src/pages/Landing.tsx` (header + footer)
   - `src/pages/Auth.tsx`
   - `src/pages/Demo.tsx`
   - `src/pages/Changelog.tsx`
   - `src/pages/ProjectNotes.tsx`
   - `src/pages/Press.tsx`
   - `src/components/AppLayout.tsx` (sidebar)
   - `src/components/MarketingPage.tsx`
   Remove the `import logo from "@/assets/orbitcrm-logo.png"` line in each.

4. **Delete the asset** `src/assets/orbitcrm-logo.png` once no references remain.

5. **Leave favicon/OG image alone** unless you want those swapped too — those live in `public/` and `index.html` and aren't part of the in-app logo.

### Open question

Pure black (`text-black`) or theme foreground (near-black, `text-foreground`)? I'll default to `text-foreground` for consistency with the rest of the design system unless you say otherwise.